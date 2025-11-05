'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface FamilyMember {
  id?: string;
  name: string;
  photoUrl?: string | null;
  dob?: string | null;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | null;
  bio?: string | null;
  location?: string | null;
  privacyLevel?: 'PRIVATE' | 'FAMILY' | 'PUBLIC';
  isPrimary?: boolean;
}

interface MemberFormProps {
  member?: FamilyMember;
  onSuccess: () => void;
  onCancel: () => void;
  existingMembers?: { id: string; name: string }[];
  preselectedRelationship?: {
    memberId: string;
    relationshipType: 'PARENT' | 'CHILD' | 'SPOUSE' | 'SIBLING';
  };
}

export function MemberForm({ member, onSuccess, onCancel, existingMembers = [], preselectedRelationship }: MemberFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FamilyMember>({
    name: member?.name || '',
    photoUrl: member?.photoUrl || '',
    dob: member?.dob || '',
    gender: member?.gender || null,
    bio: member?.bio || '',
    location: member?.location || '',
    privacyLevel: member?.privacyLevel || 'FAMILY',
    isPrimary: member?.isPrimary || false,
  });
  const [relationshipData, setRelationshipData] = useState<{
    enabled: boolean;
    relatedMemberId: string;
    relationshipType: 'PARENT' | 'CHILD' | 'SPOUSE' | 'SIBLING' | '';
  }>({
    enabled: !!preselectedRelationship,
    relatedMemberId: preselectedRelationship?.memberId || '',
    relationshipType: preselectedRelationship?.relationshipType || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('keora-auth-storage');
      const parsedToken = token ? JSON.parse(token) : null;
      const authToken = parsedToken?.state?.token;

      if (!authToken) {
        toast({
          title: 'Authentication Error',
          description: 'Please log in again',
          variant: 'destructive',
        });
        return;
      }

      // Validate relationship data if enabled
      if (!member?.id && relationshipData.enabled) {
        if (!relationshipData.relatedMemberId || !relationshipData.relationshipType) {
          toast({
            title: 'Validation Error',
            description: 'Please select a family member and relationship type',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }
      }

      const url = member?.id
        ? `/api/family-members/${member.id}`
        : '/api/family-members';

      const method = member?.id ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save family member');
      }

      // If creating a new member and relationship is enabled, create the relationship
      if (!member?.id && relationshipData.enabled && data.member) {
        const newMemberId = data.member.id;

        const relationshipResponse = await fetch('/api/relationships', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            memberId1: relationshipData.relatedMemberId,
            memberId2: newMemberId,
            relationshipType: relationshipData.relationshipType,
          }),
        });

        if (!relationshipResponse.ok) {
          const relError = await relationshipResponse.json();
          toast({
            title: 'Warning',
            description: `Member created but relationship failed: ${relError.error}`,
            variant: 'destructive',
          });
          onSuccess();
          return;
        }

        toast({
          title: 'Success',
          description: 'Family member and relationship created successfully',
        });
      } else {
        toast({
          title: 'Success',
          description: member?.id
            ? 'Family member updated successfully'
            : 'Family member created successfully',
        });
      }

      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter full name"
          required
        />
      </div>

      <div>
        <Label htmlFor="photoUrl">Photo URL</Label>
        <Input
          id="photoUrl"
          type="url"
          value={formData.photoUrl || ''}
          onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
          placeholder="https://example.com/photo.jpg"
        />
      </div>

      <div>
        <Label htmlFor="dob">Date of Birth</Label>
        <Input
          id="dob"
          type="date"
          value={formData.dob || ''}
          onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="gender">Gender</Label>
        <select
          id="gender"
          value={formData.gender || ''}
          onChange={(e) =>
            setFormData({
              ...formData,
              gender: e.target.value as 'MALE' | 'FEMALE' | 'OTHER' | null,
            })
          }
          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Select gender</option>
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={formData.location || ''}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          placeholder="City, Country"
        />
      </div>

      <div>
        <Label htmlFor="bio">Bio</Label>
        <textarea
          id="bio"
          value={formData.bio || ''}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          placeholder="Brief description about this person"
          rows={3}
          maxLength={500}
          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <Label htmlFor="privacyLevel">Privacy Level</Label>
        <select
          id="privacyLevel"
          value={formData.privacyLevel}
          onChange={(e) =>
            setFormData({
              ...formData,
              privacyLevel: e.target.value as 'PRIVATE' | 'FAMILY' | 'PUBLIC',
            })
          }
          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="PRIVATE">Private (Only You)</option>
          <option value="FAMILY">Family (Linked Users)</option>
          <option value="PUBLIC">Public (Everyone)</option>
        </select>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isPrimary"
          checked={formData.isPrimary}
          onChange={(e) =>
            setFormData({ ...formData, isPrimary: e.target.checked })
          }
          className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded"
        />
        <Label htmlFor="isPrimary" className="font-normal">
          This is my primary profile (myself)
        </Label>
      </div>

      {/* Relationship Section - Only show when adding new member and there are existing members */}
      {!member?.id && existingMembers.length > 0 && (
        <div className="border-t pt-4 mt-4">
          <div className="flex items-center space-x-2 mb-3">
            <input
              type="checkbox"
              id="addRelationship"
              checked={relationshipData.enabled}
              onChange={(e) =>
                setRelationshipData({
                  ...relationshipData,
                  enabled: e.target.checked,
                })
              }
              className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded"
              disabled={!!preselectedRelationship}
            />
            <Label htmlFor="addRelationship" className="font-semibold">
              Add relationship to existing member
              {preselectedRelationship && (
                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  Pre-configured
                </span>
              )}
            </Label>
          </div>

          {relationshipData.enabled && (
            <div className="space-y-3 pl-6 border-l-2 border-primary-200">
              <div>
                <Label htmlFor="relatedMember">Related to *</Label>
                <select
                  id="relatedMember"
                  value={relationshipData.relatedMemberId}
                  onChange={(e) =>
                    setRelationshipData({
                      ...relationshipData,
                      relatedMemberId: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required={relationshipData.enabled}
                  disabled={!!preselectedRelationship}
                >
                  <option value="">Select a family member</option>
                  {existingMembers.map((existingMember) => (
                    <option key={existingMember.id} value={existingMember.id}>
                      {existingMember.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="relationshipType">This person is their *</Label>
                <select
                  id="relationshipType"
                  value={relationshipData.relationshipType}
                  onChange={(e) =>
                    setRelationshipData({
                      ...relationshipData,
                      relationshipType: e.target.value as 'PARENT' | 'CHILD' | 'SPOUSE' | 'SIBLING',
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required={relationshipData.enabled}
                  disabled={!!preselectedRelationship}
                >
                  <option value="">Select relationship type</option>
                  <option value="PARENT">Parent</option>
                  <option value="CHILD">Child</option>
                  <option value="SPOUSE">Spouse</option>
                  <option value="SIBLING">Sibling</option>
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  {preselectedRelationship ? (
                    <span className="text-green-700 font-medium">
                      This relationship has been pre-configured based on your selection
                    </span>
                  ) : (
                    'Example: If adding your mother, select your name above and choose "Parent"'
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'Saving...' : member?.id ? 'Update Member' : 'Add Member'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
}
