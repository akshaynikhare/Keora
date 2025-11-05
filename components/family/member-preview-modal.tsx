'use client';

import { useMemo } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

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

interface MemberPreviewModalProps {
  member: FamilyMember;
  allMembers: FamilyMember[];
  onClose: () => void;
  onEdit?: (memberId: string) => void;
}

export default function MemberPreviewModal({
  member,
  allMembers,
  onClose,
  onEdit,
}: MemberPreviewModalProps) {
  // Calculate relationships with +1 level
  const relationships = useMemo(() => {
    const rels: {
      parents: FamilyMember[];
      spouse: FamilyMember | null;
      children: FamilyMember[];
      siblings: FamilyMember[];
      grandparents: FamilyMember[];
      grandchildren: FamilyMember[];
    } = {
      parents: [],
      spouse: null,
      children: [],
      siblings: [],
      grandparents: [],
      grandchildren: [],
    };

    // Direct relationships
    member.relationshipsTo.forEach((rel) => {
      if (rel.relationshipType === 'PARENT') {
        const parent = allMembers.find((m) => m.id === rel.memberId1);
        if (parent) rels.parents.push(parent);
      } else if (rel.relationshipType === 'SPOUSE') {
        const spouse = allMembers.find((m) => m.id === rel.memberId1);
        if (spouse) rels.spouse = spouse;
      } else if (rel.relationshipType === 'SIBLING') {
        const sibling = allMembers.find((m) => m.id === rel.memberId1);
        if (sibling) rels.siblings.push(sibling);
      }
    });

    member.relationshipsFrom.forEach((rel) => {
      if (rel.relationshipType === 'PARENT') {
        const child = allMembers.find((m) => m.id === rel.memberId2);
        if (child) rels.children.push(child);
      } else if (rel.relationshipType === 'SPOUSE' && !rels.spouse) {
        const spouse = allMembers.find((m) => m.id === rel.memberId2);
        if (spouse) rels.spouse = spouse;
      } else if (rel.relationshipType === 'SIBLING') {
        const sibling = allMembers.find((m) => m.id === rel.memberId2);
        if (sibling && !rels.siblings.find((s) => s.id === sibling.id)) {
          rels.siblings.push(sibling);
        }
      }
    });

    // +1 level: Grandparents (parents of parents)
    rels.parents.forEach((parent) => {
      parent.relationshipsTo.forEach((rel) => {
        if (rel.relationshipType === 'PARENT') {
          const grandparent = allMembers.find((m) => m.id === rel.memberId1);
          if (grandparent && !rels.grandparents.find((gp) => gp.id === grandparent.id)) {
            rels.grandparents.push(grandparent);
          }
        }
      });
    });

    // +1 level: Grandchildren (children of children)
    rels.children.forEach((child) => {
      child.relationshipsFrom.forEach((rel) => {
        if (rel.relationshipType === 'PARENT') {
          const grandchild = allMembers.find((m) => m.id === rel.memberId2);
          if (grandchild && !rels.grandchildren.find((gc) => gc.id === grandchild.id)) {
            rels.grandchildren.push(grandchild);
          }
        }
      });
    });

    return rels;
  }, [member, allMembers]);

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

  const age = calculateAge(member.dob);

  const MiniCard = ({ person, relation }: { person: FamilyMember; relation: string }) => (
    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border hover:bg-slate-100 transition-colors">
      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
        {person.photoUrl ? (
          <img
            src={person.photoUrl}
            alt={person.name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <span className="text-sm font-semibold">
            {person.gender === 'MALE' ? '👨' : person.gender === 'FEMALE' ? '👩' : '👤'}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{person.name}</p>
        <p className="text-xs text-slate-500">{relation}</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center">
                {member.photoUrl ? (
                  <img
                    src={member.photoUrl}
                    alt={member.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-3xl">
                    {member.gender === 'MALE' ? '👨' : member.gender === 'FEMALE' ? '👩' : '👤'}
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  {member.name}
                  {member.isPrimary && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                      ⭐ You
                    </span>
                  )}
                </h2>
                {age && <p className="text-slate-600">Age: {age} years</p>}
                {member.location && <p className="text-slate-600">📍 {member.location}</p>}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Bio */}
          {member.bio && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-2">About</h3>
              <p className="text-sm text-slate-700">{member.bio}</p>
            </div>
          )}

          {/* Relationships */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold border-b pb-2">Family Connections</h3>

            {/* Grandparents (+1 level) */}
            {relationships.grandparents.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-2">
                  Grandparents ({relationships.grandparents.length})
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {relationships.grandparents.map((gp) => (
                    <MiniCard key={gp.id} person={gp} relation="Grandparent" />
                  ))}
                </div>
              </div>
            )}

            {/* Parents */}
            {relationships.parents.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-2">
                  Parents ({relationships.parents.length})
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {relationships.parents.map((parent) => (
                    <MiniCard key={parent.id} person={parent} relation="Parent" />
                  ))}
                </div>
              </div>
            )}

            {/* Spouse */}
            {relationships.spouse && (
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-2">Spouse</h4>
                <MiniCard person={relationships.spouse} relation="Spouse" />
              </div>
            )}

            {/* Siblings */}
            {relationships.siblings.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-2">
                  Siblings ({relationships.siblings.length})
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {relationships.siblings.map((sibling) => (
                    <MiniCard key={sibling.id} person={sibling} relation="Sibling" />
                  ))}
                </div>
              </div>
            )}

            {/* Children */}
            {relationships.children.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-2">
                  Children ({relationships.children.length})
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {relationships.children.map((child) => (
                    <MiniCard key={child.id} person={child} relation="Child" />
                  ))}
                </div>
              </div>
            )}

            {/* Grandchildren (+1 level) */}
            {relationships.grandchildren.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-2">
                  Grandchildren ({relationships.grandchildren.length})
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {relationships.grandchildren.map((gc) => (
                    <MiniCard key={gc.id} person={gc} relation="Grandchild" />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3 justify-end border-t pt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {onEdit && (
              <Button onClick={() => onEdit(member.id)}>
                Edit Profile
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
