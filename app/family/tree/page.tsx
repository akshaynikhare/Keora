'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface FamilyMember {
  id: string;
  name: string;
  photoUrl?: string | null;
  dob?: string | null;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | null;
  bio?: string | null;
  location?: string | null;
  isPrimary: boolean;
  relationshipsFrom: Array<{
    id: string;
    relationshipType: string;
    member2: FamilyMember;
  }>;
  relationshipsTo: Array<{
    id: string;
    relationshipType: string;
    member1: FamilyMember;
  }>;
}

export default function FamilyTreePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchMembers();
  }, [isAuthenticated, router]);

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem('keora-auth-storage');
      const parsedToken = token ? JSON.parse(token) : null;
      const authToken = parsedToken?.state?.token;

      if (!authToken) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/family-members', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setMembers(data.members || []);
      } else {
        throw new Error(data.error || 'Failed to fetch family members');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load family tree',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getRelationships = (member: FamilyMember) => {
    const relationships: { type: string; name: string }[] = [];

    // Relationships where this member is member1
    member.relationshipsFrom.forEach((rel) => {
      relationships.push({
        type: rel.relationshipType,
        name: rel.member2.name,
      });
    });

    // Relationships where this member is member2
    member.relationshipsTo.forEach((rel) => {
      // Reverse the relationship type
      let reversedType = rel.relationshipType;
      if (rel.relationshipType === 'PARENT') reversedType = 'CHILD';
      else if (rel.relationshipType === 'CHILD') reversedType = 'PARENT';

      relationships.push({
        type: reversedType,
        name: rel.member1.name,
      });
    });

    return relationships;
  };

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

  const groupMembersByGeneration = () => {
    const primary = members.find((m) => m.isPrimary);
    if (!primary) return { generations: [], primary: null };

    // Simple grouping: grandparents, parents, self & siblings, children, grandchildren
    const generations: { [key: string]: FamilyMember[] } = {
      'Grandparents': [],
      'Parents & Aunts/Uncles': [],
      'Your Generation': [],
      'Children': [],
      'Grandchildren': [],
    };

    members.forEach((member) => {
      if (member.isPrimary) {
        generations['Your Generation'].push(member);
      } else {
        const relationships = getRelationships(member);
        const isParent = relationships.some((r) => r.type === 'CHILD');
        const isChild = relationships.some((r) => r.type === 'PARENT');
        const isSibling = relationships.some((r) => r.type === 'SIBLING');

        if (isParent && !isChild) {
          // Check if grandparent (parent of parent)
          const isGrandparent = members.some((m) =>
            getRelationships(m).some(
              (rel) => rel.type === 'PARENT' && rel.name === member.name
            )
          );
          if (isGrandparent) {
            generations['Grandparents'].push(member);
          } else {
            generations['Parents & Aunts/Uncles'].push(member);
          }
        } else if (isChild && !isParent) {
          // Check if grandchild (child of child)
          const isGrandchild = members.some((m) =>
            getRelationships(m).some(
              (rel) => rel.type === 'CHILD' && rel.name === member.name
            )
          );
          if (isGrandchild) {
            generations['Grandchildren'].push(member);
          } else {
            generations['Children'].push(member);
          }
        } else if (isSibling || relationships.some((r) => r.type === 'SPOUSE')) {
          generations['Your Generation'].push(member);
        } else {
          // Default to your generation if unclear
          generations['Your Generation'].push(member);
        }
      }
    });

    return { generations, primary };
  };

  const { generations, primary } = groupMembersByGeneration();

  const MemberCard = ({ member }: { member: FamilyMember }) => {
    const relationships = getRelationships(member);
    const age = calculateAge(member.dob);

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
              {member.photoUrl ? (
                <img
                  src={member.photoUrl}
                  alt={member.name}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <span className="text-2xl">
                  {member.gender === 'MALE' ? '♂️' : member.gender === 'FEMALE' ? '♀️' : '👤'}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                {member.name}
                {member.isPrimary && (
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                    ⭐ You
                  </span>
                )}
              </h4>
              {age && (
                <p className="text-sm text-slate-600">Age: {age} years</p>
              )}
              {member.location && (
                <p className="text-sm text-slate-600">📍 {member.location}</p>
              )}
              {relationships.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {relationships.map((rel, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-full"
                    >
                      {rel.type} of {rel.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Loading family tree...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Family Tree</h1>
              <p className="text-slate-600">
                {members.length} family member{members.length !== 1 ? 's' : ''} across {
                  Object.values(generations).filter((g) => g.length > 0).length
                } generation{Object.values(generations).filter((g) => g.length > 0).length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => router.push('/dashboard')}>
                ← Back
              </Button>
              <Button onClick={() => router.push('/family/members')}>
                Manage Members
              </Button>
            </div>
          </div>

          {/* Empty State */}
          {members.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-6xl mb-4">🌳</div>
                <h3 className="text-xl font-semibold mb-2">No family members yet</h3>
                <p className="text-slate-600 mb-6">
                  Start building your family tree by adding family members
                </p>
                <Button onClick={() => router.push('/family/members')}>
                  Add Family Members
                </Button>
              </CardContent>
            </Card>
          ) : (
            /* Generations View */
            <div className="space-y-8">
              {Object.entries(generations).map(([generation, membersList]) => {
                if (membersList.length === 0) return null;

                return (
                  <div key={generation}>
                    <div className="flex items-center gap-3 mb-4">
                      <h2 className="text-2xl font-bold text-slate-900">{generation}</h2>
                      <div className="flex-1 h-px bg-slate-300"></div>
                      <span className="text-sm text-slate-600">
                        {membersList.length} member{membersList.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {membersList.map((member) => (
                        <MemberCard key={member.id} member={member} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Info Card */}
          {members.length > 0 && (
            <Card className="mt-8 bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💡</span>
                  <div className="text-sm text-blue-900">
                    <strong>Tip:</strong> Add relationships between family members in the "Manage Members" section
                    to build a complete family tree structure.  For a visual graph view, consider implementing a
                    React Flow visualization.
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
