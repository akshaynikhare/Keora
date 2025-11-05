'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown } from 'lucide-react';

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

interface MultiLevelListViewProps {
  members: FamilyMember[];
}

interface Generation {
  level: number;
  label: string;
  members: FamilyMember[];
}

const VISIBLE_LEVELS_UP = 3;
const VISIBLE_LEVELS_DOWN = 3;

export default function MultiLevelListView({ members }: MultiLevelListViewProps) {
  const [expandedUp, setExpandedUp] = useState(false);
  const [expandedDown, setExpandedDown] = useState(false);
  const primaryRef = useRef<HTMLDivElement>(null);

  // Calculate generations based on primary user
  const { generations, primaryLevel, stats } = useMemo(() => {
    if (members.length === 0) {
      return { generations: [], primaryLevel: 0, stats: { siblings: 0 } };
    }

    const primary = members.find((m) => m.isPrimary);
    if (!primary) {
      return { generations: [], primaryLevel: 0, stats: { siblings: 0 } };
    }

    // Build a map of member ID to generation level
    const levelMap = new Map<string, number>();
    const visited = new Set<string>();

    // BFS to assign generation levels
    const assignLevel = (memberId: string, level: number) => {
      if (visited.has(memberId)) return;
      visited.add(memberId);
      levelMap.set(memberId, level);

      const member = members.find((m) => m.id === memberId);
      if (!member) return;

      // Find parents (one level up, negative direction)
      member.relationshipsTo.forEach((rel) => {
        if (rel.relationshipType === 'PARENT' && !visited.has(rel.memberId1)) {
          assignLevel(rel.memberId1, level - 1);
        }
      });

      // Find children (one level down, positive direction)
      member.relationshipsFrom.forEach((rel) => {
        if (rel.relationshipType === 'PARENT' && !visited.has(rel.memberId2)) {
          assignLevel(rel.memberId2, level + 1);
        }
      });

      // Spouses stay at same level
      member.relationshipsFrom.forEach((rel) => {
        if (rel.relationshipType === 'SPOUSE' && !visited.has(rel.memberId2)) {
          assignLevel(rel.memberId2, level);
        }
      });
      member.relationshipsTo.forEach((rel) => {
        if (rel.relationshipType === 'SPOUSE' && !visited.has(rel.memberId1)) {
          assignLevel(rel.memberId1, level);
        }
      });

      // Siblings stay at same level
      member.relationshipsFrom.forEach((rel) => {
        if (rel.relationshipType === 'SIBLING' && !visited.has(rel.memberId2)) {
          assignLevel(rel.memberId2, level);
        }
      });
      member.relationshipsTo.forEach((rel) => {
        if (rel.relationshipType === 'SIBLING' && !visited.has(rel.memberId1)) {
          assignLevel(rel.memberId1, level);
        }
      });
    };

    // Start from primary at level 0
    assignLevel(primary.id, 0);

    // Assign any unvisited members to level 0
    members.forEach((member) => {
      if (!levelMap.has(member.id)) {
        levelMap.set(member.id, 0);
      }
    });

    // Group members by level
    const levelGroups = new Map<number, FamilyMember[]>();
    levelMap.forEach((level, memberId) => {
      const member = members.find((m) => m.id === memberId);
      if (!member) return;

      if (!levelGroups.has(level)) {
        levelGroups.set(level, []);
      }
      levelGroups.get(level)!.push(member);
    });

    // Create generation objects
    const sortedLevels = Array.from(levelGroups.keys()).sort((a, b) => a - b);
    const minLevel = Math.min(...sortedLevels);
    const maxLevel = Math.max(...sortedLevels);

    const generationsList: Generation[] = [];

    // Generate labels for each level
    const getGenerationLabel = (level: number): string => {
      if (level === 0) return 'Your Generation';
      if (level < 0) {
        const absLevel = Math.abs(level);
        if (absLevel === 1) return 'Parents';
        if (absLevel === 2) return 'Grandparents';
        const prefix = 'Great-'.repeat(absLevel - 2);
        return `${prefix}Grandparents`;
      }
      if (level > 0) {
        if (level === 1) return 'Children';
        if (level === 2) return 'Grandchildren';
        const prefix = 'Great-'.repeat(level - 2);
        return `${prefix}Grandchildren`;
      }
      return `Generation ${level}`;
    };

    for (let level = minLevel; level <= maxLevel; level++) {
      const levelMembers = levelGroups.get(level) || [];
      if (levelMembers.length > 0) {
        generationsList.push({
          level,
          label: getGenerationLabel(level),
          members: levelMembers,
        });
      }
    }

    // Calculate sibling count
    const siblings = primary.relationshipsFrom
      .filter((rel) => rel.relationshipType === 'SIBLING')
      .length + primary.relationshipsTo
      .filter((rel) => rel.relationshipType === 'SIBLING')
      .length;

    return {
      generations: generationsList,
      primaryLevel: 0,
      stats: { siblings },
    };
  }, [members]);

  // Scroll to primary on mount
  useEffect(() => {
    if (primaryRef.current) {
      primaryRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  // Filter generations based on visibility
  const visibleGenerations = useMemo(() => {
    const primaryIndex = generations.findIndex((g) => g.level === primaryLevel);
    if (primaryIndex === -1) return generations;

    if (expandedUp && expandedDown) {
      return generations; // Show all
    }

    const startIndex = expandedUp ? 0 : Math.max(0, primaryIndex - VISIBLE_LEVELS_UP);
    const endIndex = expandedDown ? generations.length : Math.min(generations.length, primaryIndex + VISIBLE_LEVELS_DOWN + 1);

    return generations.slice(startIndex, endIndex);
  }, [generations, primaryLevel, expandedUp, expandedDown]);

  // Count hidden generations
  const hiddenAboveCount = useMemo(() => {
    if (expandedUp) return 0;
    const primaryIndex = generations.findIndex((g) => g.level === primaryLevel);
    return Math.max(0, primaryIndex - VISIBLE_LEVELS_UP);
  }, [generations, primaryLevel, expandedUp]);

  const hiddenBelowCount = useMemo(() => {
    if (expandedDown) return 0;
    const primaryIndex = generations.findIndex((g) => g.level === primaryLevel);
    return Math.max(0, generations.length - primaryIndex - VISIBLE_LEVELS_DOWN - 1);
  }, [generations, primaryLevel, expandedDown]);

  const calculateAge = (dob?: string | null) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const MemberCard = ({ member, isPrimary }: { member: FamilyMember; isPrimary?: boolean }) => {
    const age = calculateAge(member.dob);

    return (
      <Card className={`hover:shadow-md transition-shadow ${isPrimary ? 'ring-2 ring-amber-500' : ''}`}>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 relative">
              {member.photoUrl ? (
                <img
                  src={member.photoUrl}
                  alt={member.name}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <span className="text-2xl">
                  {member.gender === 'MALE' ? '👨' : member.gender === 'FEMALE' ? '👩' : '👤'}
                </span>
              )}
              {member.isPrimary && (
                <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full w-6 h-6 flex items-center justify-center text-white text-xs font-bold shadow-md">
                  ⭐
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-lg flex items-center gap-2 flex-wrap">
                {member.name}
                {member.isPrimary && (
                  <>
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                      You
                    </span>
                    {stats.siblings > 0 && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        {stats.siblings} Sibling{stats.siblings !== 1 ? 's' : ''}
                      </span>
                    )}
                  </>
                )}
              </h4>
              {age && (
                <p className="text-sm text-slate-600">Age: {age} years</p>
              )}
              {member.dob && (
                <p className="text-sm text-slate-500">
                  Born: {new Date(member.dob).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const ExpandButton = ({
    direction,
    count,
    onClick
  }: {
    direction: 'up' | 'down';
    count: number;
    onClick: () => void;
  }) => {
    if (count === 0) return null;

    return (
      <div className="flex justify-center py-4">
        <Button
          variant="outline"
          size="lg"
          onClick={onClick}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border-2 border-blue-200"
        >
          {direction === 'up' ? (
            <>
              <ChevronUp className="h-5 w-5" />
              Show {count} More Generation{count !== 1 ? 's' : ''} Above
            </>
          ) : (
            <>
              <ChevronDown className="h-5 w-5" />
              Show {count} More Generation{count !== 1 ? 's' : ''} Below
            </>
          )}
        </Button>
      </div>
    );
  };

  if (members.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🌳</div>
        <h3 className="text-xl font-semibold mb-2">No family members yet</h3>
        <p className="text-slate-600">Start building your family tree by adding family members</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Show expand button for ancestors */}
      {hiddenAboveCount > 0 && (
        <ExpandButton
          direction="up"
          count={hiddenAboveCount}
          onClick={() => setExpandedUp(true)}
        />
      )}

      {/* Render visible generations */}
      {visibleGenerations.map((generation, index) => {
        const isPrimaryGeneration = generation.level === primaryLevel;
        const primaryMember = isPrimaryGeneration ? generation.members.find((m) => m.isPrimary) : null;

        return (
          <div
            key={generation.level}
            ref={isPrimaryGeneration ? primaryRef : null}
            className={isPrimaryGeneration ? 'scroll-mt-4' : ''}
          >
            <div className="flex items-center gap-3 mb-4">
              <h2 className={`text-2xl font-bold ${isPrimaryGeneration ? 'text-amber-700' : 'text-slate-900'}`}>
                {generation.label}
              </h2>
              <div className="flex-1 h-px bg-slate-300"></div>
              <span className="text-sm text-slate-600">
                {generation.members.length} member{generation.members.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generation.members.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  isPrimary={member.isPrimary}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* Show expand button for descendants */}
      {hiddenBelowCount > 0 && (
        <ExpandButton
          direction="down"
          count={hiddenBelowCount}
          onClick={() => setExpandedDown(true)}
        />
      )}

      {/* Info card */}
      <Card className="mt-8 bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div className="text-sm text-blue-900">
              <strong>Multi-Level List View:</strong>
              <ul className="list-disc ml-5 mt-2 space-y-1">
                <li>Shows {VISIBLE_LEVELS_UP} generations of ancestors and {VISIBLE_LEVELS_DOWN} generations of descendants by default</li>
                <li>Click the expand buttons to reveal more generations</li>
                <li>Your profile is highlighted with a gold star and ring</li>
                <li>Sibling count is displayed next to your profile</li>
                <li>Generations are ordered from oldest (top) to youngest (bottom)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
