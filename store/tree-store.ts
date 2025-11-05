import { create } from 'zustand';

interface FamilyMember {
  id: string;
  userId: string;
  name: string;
  photoUrl?: string | null;
  dob?: Date | null;
  gender?: string | null;
  bio?: string | null;
  location?: string | null;
  privacyLevel: string;
  isPrimary: boolean;
}

interface Relationship {
  id: string;
  memberId1: string;
  memberId2: string;
  relationshipType: string;
}

interface TreeState {
  members: FamilyMember[];
  relationships: Relationship[];
  selectedMember: FamilyMember | null;
  setMembers: (members: FamilyMember[]) => void;
  setRelationships: (relationships: Relationship[]) => void;
  addMember: (member: FamilyMember) => void;
  updateMember: (id: string, data: Partial<FamilyMember>) => void;
  deleteMember: (id: string) => void;
  setSelectedMember: (member: FamilyMember | null) => void;
  addRelationship: (relationship: Relationship) => void;
  deleteRelationship: (id: string) => void;
}

export const useTreeStore = create<TreeState>((set) => ({
  members: [],
  relationships: [],
  selectedMember: null,
  setMembers: (members) => set({ members }),
  setRelationships: (relationships) => set({ relationships }),
  addMember: (member) => set((state) => ({ members: [...state.members, member] })),
  updateMember: (id, data) =>
    set((state) => ({
      members: state.members.map((m) => (m.id === id ? { ...m, ...data } : m)),
    })),
  deleteMember: (id) =>
    set((state) => ({
      members: state.members.filter((m) => m.id !== id),
      relationships: state.relationships.filter(
        (r) => r.memberId1 !== id && r.memberId2 !== id
      ),
    })),
  setSelectedMember: (member) => set({ selectedMember: member }),
  addRelationship: (relationship) =>
    set((state) => ({ relationships: [...state.relationships, relationship] })),
  deleteRelationship: (id) =>
    set((state) => ({ relationships: state.relationships.filter((r) => r.id !== id) })),
}));
