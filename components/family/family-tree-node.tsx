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
    isLarge?: boolean;
  };
}

function FamilyTreeNode({ data }: FamilyTreeNodeProps) {
  const { member, branchColor, isLarge = false } = data;

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

  // Size based on isLarge prop (primary user is larger)
  const photoSize = isLarge ? '120px' : '80px';
  const minWidth = isLarge ? '200px' : '140px';
  const textSize = isLarge ? 'text-base' : 'text-sm';
  const badgeSize = isLarge ? 'w-8 h-8 text-base' : 'w-6 h-6 text-xs';
  const initialsSize = isLarge ? 'text-4xl' : 'text-2xl';

  return (
    <div className="family-tree-node">
      <Handle type="target" position={Position.Top} style={{ background: nodeColor, opacity: 0.8 }} />

      <div className="flex flex-col items-center" style={{ minWidth }}>
        {/* Circular Photo */}
        <div
          className="relative mb-2 rounded-full overflow-hidden shadow-lg"
          style={{
            width: photoSize,
            height: photoSize,
            border: `${isLarge ? '5px' : '4px'} solid ${nodeColor}`,
            boxShadow: member.isPrimary ? `0 0 0 ${isLarge ? '6px' : '4px'} rgba(245, 158, 11, 0.2)` : undefined,
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
              className={`w-full h-full flex items-center justify-center ${initialsSize} font-bold`}
              style={{ backgroundColor: `${nodeColor}20`, color: nodeColor }}
            >
              {member.name.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Primary badge */}
          {member.isPrimary && (
            <div className={`absolute -top-1 -right-1 bg-amber-500 rounded-full ${badgeSize} flex items-center justify-center text-white font-bold shadow-md`}>
              ⭐
            </div>
          )}
        </div>

        {/* Name */}
        <div className="text-center bg-white px-3 py-2 rounded-lg shadow-sm border-2" style={{ borderColor: nodeColor }}>
          <div className={`font-semibold ${textSize} text-gray-900 leading-tight`}>
            {member.name}
          </div>
          {birthYear && (
            <div className={`${isLarge ? 'text-sm' : 'text-xs'} text-gray-500 mt-1`}>
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
