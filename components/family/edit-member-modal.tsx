'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
}

interface EditMemberModalProps {
  member: FamilyMember;
  onClose: () => void;
  onSave: (updatedMember: Partial<FamilyMember>) => Promise<void>;
}

export default function EditMemberModal({ member, onClose, onSave }: EditMemberModalProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: member.name || '',
    dob: member.dob ? new Date(member.dob).toISOString().split('T')[0] : '',
    gender: member.gender || 'OTHER',
    bio: member.bio || '',
    location: member.location || '',
    photoUrl: member.photoUrl || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await onSave({
        ...formData,
        dob: formData.dob || null,
        bio: formData.bio || null,
        location: formData.location || null,
        photoUrl: formData.photoUrl || null,
      });

      toast({
        title: 'Success',
        description: 'Member information updated successfully',
      });

      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update member information',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Edit Family Member</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter full name"
                required
              />
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              />
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value as 'MALE' | 'FEMALE' | 'OTHER' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="City, Country"
              />
            </div>

            {/* Photo URL */}
            <div className="space-y-2">
              <Label htmlFor="photoUrl">Photo URL</Label>
              <Input
                id="photoUrl"
                value={formData.photoUrl}
                onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                placeholder="https://example.com/photo.jpg"
              />
              {formData.photoUrl && (
                <div className="mt-2">
                  <img
                    src={formData.photoUrl}
                    alt="Preview"
                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about this family member..."
                rows={4}
              />
            </div>

            {/* Primary Member Notice */}
            {member.isPrimary && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  ⭐ This is your profile (primary member)
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
