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
  const [currentOrientation, setCurrentOrientation] = useState(orientation);

  // Generate tree layout
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    if (members.length === 0) {
      return { nodes: [], edges: [] };
    }

    const primary = members.find((m) => m.isPrimary);
    if (!primary) {
      return { nodes: [], edges: [] };
    }

    // Build generations map
    const generationsMap = new Map<string, number>();
    const visited = new Set<string>();
    const branchColorMap = new Map<string, string>();
    const processedRelationships = new Set<string>();

    // Helper to get relationship key (to avoid duplicates)
    const getRelKey = (id1: string, id2: string) => {
      return [id1, id2].sort().join('-');
    };

    // Assign generation levels using BFS with proper parent-child tracking
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

      // Find spouse (same generation)
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

      // Find siblings (same generation)
      member.relationshipsFrom.forEach((rel) => {
        if (rel.relationshipType === 'SIBLING') {
          if (!visited.has(rel.memberId2)) {
            assignGenerations(rel.memberId2, generation);
          }
        }
      });
      member.relationshipsTo.forEach((rel) => {
        if (rel.relationshipType === 'SIBLING') {
          if (!visited.has(rel.memberId1)) {
            assignGenerations(rel.memberId1, generation);
          }
        }
      });
    };

    // Start from primary member at generation 0
    assignGenerations(primary.id, 0);

    // Assign unvisited members to generation 0 (siblings, etc.)
    members.forEach((member) => {
      if (!generationsMap.has(member.id)) {
        generationsMap.set(member.id, 0);
      }
    });

    // Group by generation
    const generations = new Map<number, string[]>();
    generationsMap.forEach((gen, memberId) => {
      if (!generations.has(gen)) {
        generations.set(gen, []);
      }
      generations.get(gen)!.push(memberId);
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

    // Create nodes
    const nodes: Node[] = [];
    const HORIZONTAL_SPACING = 200;
    const VERTICAL_SPACING = 200;

    sortedGenerations.forEach(([generation, memberIds], genIndex) => {
      const yPos = genIndex * VERTICAL_SPACING;
      const totalWidth = memberIds.length * HORIZONTAL_SPACING;
      const startX = -totalWidth / 2;

      memberIds.forEach((memberId, index) => {
        const member = members.find((m) => m.id === memberId);
        if (!member) return;

        nodes.push({
          id: memberId,
          type: 'familyMember',
          position: {
            x: startX + index * HORIZONTAL_SPACING,
            y: yPos,
          },
          data: {
            member,
            branchColor: branchColorMap.get(memberId) || BRANCH_COLORS[0],
          },
        });
      });
    });

    // Create edges
    const edges: Edge[] = [];
    const edgeSet = new Set<string>(); // To avoid duplicates

    members.forEach((member) => {
      // Parent-child relationships (only from parent to child)
      member.relationshipsFrom.forEach((rel) => {
        if (rel.relationshipType === 'PARENT') {
          const edgeKey = `parent-${member.id}-${rel.memberId2}`;
          const reverseKey = `parent-${rel.memberId2}-${member.id}`;

          if (!edgeSet.has(edgeKey) && !edgeSet.has(reverseKey)) {
            edgeSet.add(edgeKey);
            edges.push({
              id: edgeKey,
              source: member.id,
              target: rel.memberId2,
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
        if (rel.relationshipType === 'SPOUSE') {
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

      // Sibling relationships (dashed line)
      member.relationshipsFrom.forEach((rel) => {
        if (rel.relationshipType === 'SIBLING') {
          const ids = [member.id, rel.memberId2].sort();
          const edgeKey = `sibling-${ids[0]}-${ids[1]}`;

          if (!edgeSet.has(edgeKey)) {
            edgeSet.add(edgeKey);
            edges.push({
              id: edgeKey,
              source: ids[0],
              target: ids[1],
              type: 'straight',
              animated: false,
              style: {
                stroke: '#94a3b8',
                strokeWidth: 2,
                strokeDasharray: '3,3',
              },
            });
          }
        }
      });
    });

    return { nodes, edges };
  }, [members, currentOrientation]);

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
        fitView
        minZoom={0.1}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
      >
        <Background color="#f0f0f0" gap={20} />
        <Controls />

        {/* Orientation Toggle Panel */}
        <Panel position="top-right" className="bg-white p-2 rounded-lg shadow-md border">
          <div className="flex flex-col gap-2">
            <Button
              size="sm"
              variant={currentOrientation === 'TB' ? 'default' : 'outline'}
              onClick={() => setCurrentOrientation('TB')}
              className="text-xs"
            >
              ⬇ Top-Down
            </Button>
            <Button
              size="sm"
              variant={currentOrientation === 'BT' ? 'default' : 'outline'}
              onClick={() => setCurrentOrientation('BT')}
              className="text-xs"
            >
              ⬆ Bottom-Up
            </Button>
          </div>
        </Panel>

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
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-4 h-0.5 bg-pink-500" style={{ backgroundImage: 'repeating-linear-gradient(to right, #ec4899 0, #ec4899 3px, transparent 3px, transparent 6px)' }}></div>
                  <span>❤️ Spouse</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 bg-slate-400" style={{ backgroundImage: 'repeating-linear-gradient(to right, #94a3b8 0, #94a3b8 2px, transparent 2px, transparent 4px)' }}></div>
                  <span>Sibling</span>
                </div>
              </div>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
