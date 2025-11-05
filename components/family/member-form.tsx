'use client';

import { useState } from 'react';
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
}

export function MemberForm({ member, onSuccess, onCancel }: MemberFormProps) {
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

      toast({
        title: 'Success',
        description: member?.id
          ? 'Family member updated successfully'
          : 'Family member created successfully',
      });

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
