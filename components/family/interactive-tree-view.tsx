'use client';

import { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import FamilyTreeNode from './family-tree-node';
import { Button } from '@/components/ui/button';

interface FamilyMember {
  id: string;
  name: string;
  photoUrl?: string | null;
  dob?: string | null;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | null;
  isPrimary: boolean;
  relationshipsFrom: Array<{
    id: string;
    memberId1: string;
    memberId2: string;
    relationshipType: string;
    member2: {
      id: string;
      name: string;
    };
  }>;
  relationshipsTo: Array<{
    id: string;
    memberId1: string;
    memberId2: string;
    relationshipType: string;
    member1: {
      id: string;
      name: string;
    };
  }>;
}

interface InteractiveTreeViewProps {
  members: FamilyMember[];
  orientation: 'TB' | 'BT'; // Top-Bottom or Bottom-Top
}

const nodeTypes = {
  familyMember: FamilyTreeNode,
};

// Branch colors for different family lines
const BRANCH_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function InteractiveTreeView({ members, orientation }: InteractiveTreeViewProps) {
  const [currentOrientation, setCurrentOrientation] = useState<'TB' | 'BT'>('TB');
  const [expandedLevels, setExpandedLevels] = useState({ up: false, down: false });

  const VISIBLE_LEVELS = 3;

  // Generate tree layout
  const { nodes: initialNodes, edges: initialEdges, hiddenCounts } = useMemo(() => {
    if (members.length === 0) {
      return { nodes: [], edges: [], hiddenCounts: { up: 0, down: 0 } };
    }

    const primary = members.find((m) => m.isPrimary);
    if (!primary) {
      return { nodes: [], edges: [], hiddenCounts: { up: 0, down: 0 } };
    }

    // Build generations map (only parents/children, no siblings)
    const generationsMap = new Map<string, number>();
    const visited = new Set<string>();
    const branchColorMap = new Map<string, string>();
    const processedRelationships = new Set<string>();

    // Helper to get relationship key (to avoid duplicates)
    const getRelKey = (id1: string, id2: string) => {
      return [id1, id2].sort().join('-');
    };

    // Assign generation levels using BFS - ONLY parents, children, and spouses (NO siblings)
    const assignGenerations = (startMemberId: string, generation: number) => {
      if (visited.has(startMemberId)) return;
      visited.add(startMemberId);
      generationsMap.set(startMemberId, generation);

      const member = members.find((m) => m.id === startMemberId);
      if (!member) return;

      // Find parents (members who have this member as a child)
      member.relationshipsTo.forEach((rel) => {
        if (rel.relationshipType === 'PARENT') {
          const relKey = getRelKey(rel.memberId1, member.id);
          if (!processedRelationships.has(relKey)) {
            processedRelationships.add(relKey);
            assignGenerations(rel.memberId1, generation - 1);
          }
        }
      });

      // Find children
      member.relationshipsFrom.forEach((rel) => {
        if (rel.relationshipType === 'PARENT') {
          const relKey = getRelKey(member.id, rel.memberId2);
          if (!processedRelationships.has(relKey)) {
            processedRelationships.add(relKey);
            assignGenerations(rel.memberId2, generation + 1);
          }
        }
      });

      // Find spouse (same generation) - include spouses to show family units
      member.relationshipsFrom.forEach((rel) => {
        if (rel.relationshipType === 'SPOUSE') {
          if (!visited.has(rel.memberId2)) {
            assignGenerations(rel.memberId2, generation);
          }
        }
      });
      member.relationshipsTo.forEach((rel) => {
        if (rel.relationshipType === 'SPOUSE') {
          if (!visited.has(rel.memberId1)) {
            assignGenerations(rel.memberId1, generation);
          }
        }
      });

      // NOTE: Siblings are intentionally excluded from tree view
    };

    // Start from primary member at generation 0
    assignGenerations(primary.id, 0);

    // Calculate min and max generations
    const allGenerations = Array.from(generationsMap.values());
    const minGen = Math.min(...allGenerations);
    const maxGen = Math.max(...allGenerations);

    // Filter members based on visible levels
    const visibleMembers = new Set<string>();
    const minVisible = expandedLevels.up ? minGen : Math.max(minGen, -VISIBLE_LEVELS);
    const maxVisible = expandedLevels.down ? maxGen : Math.min(maxGen, VISIBLE_LEVELS);

    generationsMap.forEach((gen, memberId) => {
      if (gen >= minVisible && gen <= maxVisible) {
        visibleMembers.add(memberId);
      }
    });

    // Calculate hidden counts
    const hiddenUp = Math.max(0, Math.abs(minGen) - VISIBLE_LEVELS);
    const hiddenDown = Math.max(0, maxGen - VISIBLE_LEVELS);
    const hiddenCounts = { up: hiddenUp, down: hiddenDown };

    // Group by generation (only visible members)
    const generations = new Map<number, string[]>();
    generationsMap.forEach((gen, memberId) => {
      if (visibleMembers.has(memberId)) {
        if (!generations.has(gen)) {
          generations.set(gen, []);
        }
        generations.get(gen)!.push(memberId);
      }
    });

    // Sort generations
    const sortedGenerations = Array.from(generations.entries()).sort((a, b) =>
      currentOrientation === 'TB' ? a[0] - b[0] : b[0] - a[0]
    );

    // Assign branch colors
    let colorIndex = 0;
    sortedGenerations.forEach(([_, memberIds], genIndex) => {
      memberIds.forEach((memberId, index) => {
        if (!branchColorMap.has(memberId)) {
          branchColorMap.set(memberId, BRANCH_COLORS[colorIndex % BRANCH_COLORS.length]);
          if (index % 2 === 1) colorIndex++;
        }
      });
    });

    // Create nodes with hierarchical layout
    const nodes: Node[] = [];
    const HORIZONTAL_SPACING = 250;
    const VERTICAL_SPACING = 220;
    const SPOUSE_OFFSET = 200;

    // Track positions to avoid overlaps
    const positionedMembers = new Set<string>();
    const nodePositions = new Map<string, { x: number; y: number }>();

    // Helper to get children of a member
    const getChildren = (memberId: string) => {
      const member = members.find(m => m.id === memberId);
      if (!member) return [];
      return member.relationshipsFrom
        .filter(rel => rel.relationshipType === 'PARENT')
        .map(rel => rel.memberId2);
    };

    // Helper to get spouse of a member
    const getSpouse = (memberId: string) => {
      const member = members.find(m => m.id === memberId);
      if (!member) return null;
      const spouseRel = member.relationshipsFrom.find(rel => rel.relationshipType === 'SPOUSE');
      if (spouseRel) return spouseRel.memberId2;
      const spouseRelTo = member.relationshipsTo.find(rel => rel.relationshipType === 'SPOUSE');
      if (spouseRelTo) return spouseRelTo.memberId1;
      return null;
    };

    // Calculate subtree width (for centering parents above children)
    const calculateSubtreeWidth = (memberId: string, visited = new Set<string>()): number => {
      if (visited.has(memberId)) return 0;
      visited.add(memberId);

      const children = getChildren(memberId);
      const spouse = getSpouse(memberId);

      // Include spouse in calculation
      if (spouse && !visited.has(spouse)) {
        visited.add(spouse);
        const spouseChildren = getChildren(spouse);
        children.push(...spouseChildren.filter(c => !children.includes(c)));
      }

      if (children.length === 0) {
        return 1; // Leaf node width
      }

      let totalWidth = 0;
      children.forEach(childId => {
        totalWidth += calculateSubtreeWidth(childId, visited);
      });

      return Math.max(1, totalWidth);
    };

    // Position nodes recursively (depth-first)
    let currentXOffset = 0;

    const positionNode = (memberId: string, generationLevel: number, visited = new Set<string>()) => {
      if (visited.has(memberId) || positionedMembers.has(memberId)) return;
      visited.add(memberId);

      const children = getChildren(memberId);
      const spouse = getSpouse(memberId);

      // Position children first (post-order traversal)
      const childPositions: number[] = [];
      children.forEach(childId => {
        if (!positionedMembers.has(childId)) {
          positionNode(childId, generationLevel + 1, visited);
          const childPos = nodePositions.get(childId);
          if (childPos) childPositions.push(childPos.x);
        }
      });

      // Calculate this node's X position
      let xPos: number;
      if (childPositions.length > 0) {
        // Center parent above children
        const minX = Math.min(...childPositions);
        const maxX = Math.max(...childPositions);
        xPos = (minX + maxX) / 2;
      } else {
        // Leaf node - use next available position
        xPos = currentXOffset * HORIZONTAL_SPACING;
        currentXOffset++;
      }

      // Calculate Y position based on actual generation number
      const actualGeneration = generationsMap.get(memberId) || 0;
      const genIndex = sortedGenerations.findIndex(([gen, _]) => gen === actualGeneration);
      const yPos = genIndex >= 0 ? genIndex * VERTICAL_SPACING : generationLevel * VERTICAL_SPACING;

      // Position this member
      nodePositions.set(memberId, { x: xPos, y: yPos });
      positionedMembers.add(memberId);

      // Position spouse next to this member
      if (spouse && !positionedMembers.has(spouse)) {
        nodePositions.set(spouse, { x: xPos + SPOUSE_OFFSET, y: yPos });
        positionedMembers.add(spouse);
      }
    };

    // Find root members (those with no parents in the tree)
    const rootMembers = sortedGenerations[0][1];

    // Position each root and their descendants
    rootMembers.forEach((rootId, index) => {
      if (!positionedMembers.has(rootId)) {
        const genIndex = sortedGenerations.findIndex(([_, ids]) => ids.includes(rootId));
        if (genIndex >= 0) {
          positionNode(rootId, genIndex, new Set());
        }
      }
    });

    // Position any remaining members (disconnected from main tree)
    sortedGenerations.forEach(([generation, memberIds], genIndex) => {
      memberIds.forEach(memberId => {
        if (!positionedMembers.has(memberId)) {
          const xPos = currentXOffset * HORIZONTAL_SPACING;
          currentXOffset++;
          const yPos = genIndex * VERTICAL_SPACING;
          nodePositions.set(memberId, { x: xPos, y: yPos });
          positionedMembers.add(memberId);
        }
      });
    });

    // Create nodes from calculated positions (only visible members)
    nodePositions.forEach((position, memberId) => {
      if (!visibleMembers.has(memberId)) return;

      const member = members.find((m) => m.id === memberId);
      if (!member) return;

      nodes.push({
        id: memberId,
        type: 'familyMember',
        position: position,
        data: {
          member,
          branchColor: branchColorMap.get(memberId) || BRANCH_COLORS[0],
          isLarge: member.isPrimary, // Make primary user node larger
        },
      });
    });

    // Create edges (only for visible members, exclude siblings)
    const edges: Edge[] = [];
    const edgeSet = new Set<string>(); // To avoid duplicates

    members.forEach((member) => {
      if (!visibleMembers.has(member.id)) return;

      // Parent-child relationships
      // Note: In seed data, PARENT type means memberId1 (member) is parent of memberId2 (rel.memberId2)
      // Arrow should point from parent (member) → child (rel.memberId2)
      member.relationshipsFrom.forEach((rel) => {
        if (rel.relationshipType === 'PARENT' && visibleMembers.has(rel.memberId2)) {
          const edgeKey = `parent-${member.id}-${rel.memberId2}`;
          const reverseKey = `parent-${rel.memberId2}-${member.id}`;

          if (!edgeSet.has(edgeKey) && !edgeSet.has(reverseKey)) {
            edgeSet.add(edgeKey);
            edges.push({
              id: edgeKey,
              source: member.id,        // Parent (older generation)
              target: rel.memberId2,    // Child (younger generation)
              type: 'smoothstep',
              animated: false,
              style: {
                stroke: branchColorMap.get(member.id) || BRANCH_COLORS[0],
                strokeWidth: 3,
              },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: branchColorMap.get(member.id) || BRANCH_COLORS[0],
                width: 20,
                height: 20,
              },
            });
          }
        }
      });

      // Spouse relationships (horizontal line with heart)
      member.relationshipsFrom.forEach((rel) => {
        if (rel.relationshipType === 'SPOUSE' && visibleMembers.has(rel.memberId2)) {
          const ids = [member.id, rel.memberId2].sort();
          const edgeKey = `spouse-${ids[0]}-${ids[1]}`;

          if (!edgeSet.has(edgeKey)) {
            edgeSet.add(edgeKey);
            edges.push({
              id: edgeKey,
              source: ids[0],
              target: ids[1],
              type: 'straight',
              animated: false,
              style: {
                stroke: '#ec4899',
                strokeWidth: 2,
                strokeDasharray: '5,5',
              },
              label: '❤️',
              labelStyle: { fontSize: 16 },
              labelBgStyle: { fill: 'transparent' },
            });
          }
        }
      });

      // NOTE: Sibling relationships are intentionally excluded from tree view
    });

    return { nodes, edges, hiddenCounts };
  }, [members, currentOrientation, expandedLevels]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const toggleOrientation = useCallback(() => {
    setCurrentOrientation((prev) => (prev === 'TB' ? 'BT' : 'TB'));
  }, []);

  return (
    <div className="w-full h-[700px] bg-white rounded-lg border-2 border-gray-200 shadow-lg">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        fitView
        minZoom={0.1}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
      >
        <Background color="#f0f0f0" gap={20} />
        <Controls />

        {/* Expand Levels Panel */}
        {(hiddenCounts.up > 0 || hiddenCounts.down > 0) && (
          <Panel position="top-right" className="bg-white p-3 rounded-lg shadow-md border">
            <div className="flex flex-col gap-2">
              <div className="text-xs font-semibold mb-1">Hidden Levels</div>
              {hiddenCounts.up > 0 && !expandedLevels.up && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setExpandedLevels(prev => ({ ...prev, up: true }))}
                  className="text-xs"
                >
                  ⬆ Show {hiddenCounts.up} Ancestors
                </Button>
              )}
              {hiddenCounts.down > 0 && !expandedLevels.down && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setExpandedLevels(prev => ({ ...prev, down: true }))}
                  className="text-xs"
                >
                  ⬇ Show {hiddenCounts.down} Descendants
                </Button>
              )}
              {(expandedLevels.up || expandedLevels.down) && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setExpandedLevels({ up: false, down: false })}
                  className="text-xs"
                >
                  Reset View
                </Button>
              )}
            </div>
          </Panel>
        )}

        {/* Legend Panel */}
        <Panel position="top-left" className="bg-white p-3 rounded-lg shadow-md border">
          <div className="text-xs">
            <div className="font-semibold mb-2">Legend</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>Male</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                <span>Female</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500 flex items-center justify-center text-white text-[8px]">
                  ⭐
                </div>
                <span>You</span>
              </div>
              <div className="border-t pt-1 mt-1">
                <div className="font-semibold mb-1">Relationships</div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center">
                    <div className="w-4 h-0.5 bg-blue-500"></div>
                    <div className="w-0 h-0 border-l-4 border-l-blue-500 border-t-2 border-t-transparent border-b-2 border-b-transparent"></div>
                  </div>
                  <span>Parent → Child</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 bg-pink-500" style={{ backgroundImage: 'repeating-linear-gradient(to right, #ec4899 0, #ec4899 3px, transparent 3px, transparent 6px)' }}></div>
                  <span>❤️ Spouse</span>
                </div>
              </div>
              <div className="border-t pt-1 mt-1">
                <div className="text-[10px] text-gray-500">
                  Showing 3 levels up/down from you. Siblings not shown in tree view.
                </div>
              </div>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
