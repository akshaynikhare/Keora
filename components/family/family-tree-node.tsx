import { memo } from 'react';
import { Handle, Position } from 'reactflow';

interface FamilyMember {
  id: string;
  name: string;
  photoUrl?: string | null;
  dob?: string | null;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | null;
  isPrimary?: boolean;
}

interface FamilyTreeNodeProps {
  data: {
    member: FamilyMember;
    branchColor: string;
  };
}

function FamilyTreeNode({ data }: FamilyTreeNodeProps) {
  const { member, branchColor } = data;

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
  const birthYear = member.dob ? new Date(member.dob).getFullYear() : null;

  // Gender-based default colors
  const defaultColor = member.gender === 'MALE' ? '#3b82f6' : member.gender === 'FEMALE' ? '#ec4899' : '#8b5cf6';
  const nodeColor = member.isPrimary ? '#f59e0b' : branchColor || defaultColor;

  return (
    <div className="family-tree-node">
      <Handle type="target" position={Position.Top} style={{ background: nodeColor, opacity: 0.8 }} />

      <div className="flex flex-col items-center" style={{ minWidth: '140px' }}>
        {/* Circular Photo */}
        <div
          className="relative mb-2 rounded-full overflow-hidden shadow-lg"
          style={{
            width: '80px',
            height: '80px',
            border: `4px solid ${nodeColor}`,
            boxShadow: member.isPrimary ? `0 0 0 4px rgba(245, 158, 11, 0.2)` : undefined,
          }}
        >
          {member.photoUrl ? (
            <img
              src={member.photoUrl}
              alt={member.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-2xl font-bold"
              style={{ backgroundColor: `${nodeColor}20`, color: nodeColor }}
            >
              {member.name.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Primary badge */}
          {member.isPrimary && (
            <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full w-6 h-6 flex items-center justify-center text-white text-xs font-bold shadow-md">
              ⭐
            </div>
          )}
        </div>

        {/* Name */}
        <div className="text-center bg-white px-3 py-2 rounded-lg shadow-sm border-2" style={{ borderColor: nodeColor }}>
          <div className="font-semibold text-sm text-gray-900 leading-tight">
            {member.name}
          </div>
          {birthYear && (
            <div className="text-xs text-gray-500 mt-1">
              {birthYear}{age && ` (${age})`}
            </div>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} style={{ background: nodeColor, opacity: 0.8 }} />
    </div>
  );
}

export default memo(FamilyTreeNode);
