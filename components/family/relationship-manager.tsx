'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface FamilyMember {
  id: string;
  name: string;
}

interface RelationshipManagerProps {
  members: FamilyMember[];
  onSuccess: () => void;
}

export function RelationshipManager({ members, onSuccess }: RelationshipManagerProps) {
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    memberId1: '',
    memberId2: '',
    relationshipType: '' as 'PARENT' | 'CHILD' | 'SPOUSE' | 'SIBLING' | '',
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

      if (!formData.memberId1 || !formData.memberId2 || !formData.relationshipType) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all fields',
          variant: 'destructive',
        });
        return;
      }

      const response = await fetch('/api/relationships', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          memberId1: formData.memberId1,
          memberId2: formData.memberId2,
          relationshipType: formData.relationshipType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create relationship');
      }

      toast({
        title: 'Success',
        description: 'Relationship created successfully',
      });

      setFormData({ memberId1: '', memberId2: '', relationshipType: '' });
      setShowDialog(false);
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

  const getMember1Name = () => {
    const member = members.find(m => m.id === formData.memberId1);
    return member?.name || 'selected person';
  };

  const getRelationshipDescription = () => {
    if (!formData.relationshipType || !formData.memberId1) return '';

    const member1Name = getMember1Name();

    switch (formData.relationshipType) {
      case 'PARENT':
        return `The person in the second dropdown will be set as the parent of ${member1Name}`;
      case 'CHILD':
        return `The person in the second dropdown will be set as the child of ${member1Name}`;
      case 'SPOUSE':
        return `The person in the second dropdown will be set as the spouse of ${member1Name}`;
      case 'SIBLING':
        return `The person in the second dropdown will be set as the sibling of ${member1Name}`;
      default:
        return '';
    }
  };

  return (
    <>
      <Button onClick={() => setShowDialog(true)} variant="outline" className="w-full">
        <span className="mr-2">🔗</span>
        Add Relationship Between Members
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Relationship</DialogTitle>
            <DialogDescription>
              Create a relationship between two family members
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="member1">First Person *</Label>
              <select
                id="member1"
                value={formData.memberId1}
                onChange={(e) =>
                  setFormData({ ...formData, memberId1: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Select a family member</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="relationshipType">Relationship Type *</Label>
              <select
                id="relationshipType"
                value={formData.relationshipType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    relationshipType: e.target.value as 'PARENT' | 'CHILD' | 'SPOUSE' | 'SIBLING',
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Select relationship type</option>
                <option value="PARENT">Parent</option>
                <option value="CHILD">Child</option>
                <option value="SPOUSE">Spouse</option>
                <option value="SIBLING">Sibling</option>
              </select>
            </div>

            <div>
              <Label htmlFor="member2">Second Person *</Label>
              <select
                id="member2"
                value={formData.memberId2}
                onChange={(e) =>
                  setFormData({ ...formData, memberId2: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Select a family member</option>
                {members
                  .filter((m) => m.id !== formData.memberId1)
                  .map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
              </select>
            </div>

            {getRelationshipDescription() && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> {getRelationshipDescription()}
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Creating...' : 'Create Relationship'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
