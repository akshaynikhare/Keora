'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { MemberForm } from '@/components/family/member-form';
import { RelationshipManager } from '@/components/family/relationship-manager';

interface FamilyMember {
  id: string;
  name: string;
  photoUrl?: string | null;
  dob?: string | null;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | null;
  bio?: string | null;
  location?: string | null;
  privacyLevel: 'PRIVATE' | 'FAMILY' | 'PUBLIC';
  isPrimary: boolean;
  createdAt: string;
}

export default function FamilyMembersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
        description: error.message || 'Failed to load family members',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this family member? This will also remove all their relationships.')) {
      return;
    }

    setDeletingId(id);

    try {
      const token = localStorage.getItem('keora-auth-storage');
      const parsedToken = token ? JSON.parse(token) : null;
      const authToken = parsedToken?.state?.token;

      const response = await fetch(`/api/family-members/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Family member deleted successfully',
        });
        fetchMembers();
      } else {
        throw new Error(data.error || 'Failed to delete family member');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete family member',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getGenderIcon = (gender?: string | null) => {
    if (gender === 'MALE') return '♂️';
    if (gender === 'FEMALE') return '♀️';
    return '👤';
  };

  const getPrivacyBadge = (level: string) => {
    const badges = {
      PRIVATE: { icon: '🔒', color: 'bg-slate-100 text-slate-700', label: 'Private' },
      FAMILY: { icon: '👥', color: 'bg-blue-100 text-blue-700', label: 'Family' },
      PUBLIC: { icon: '🌍', color: 'bg-green-100 text-green-700', label: 'Public' },
    };
    const badge = badges[level as keyof typeof badges] || badges.PRIVATE;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.icon} {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Loading family members...</p>
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
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Family Members</h1>
              <p className="text-slate-600">
                Manage your family tree members ({members.length} member{members.length !== 1 ? 's' : ''})
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => router.push('/dashboard')}>
                ← Back to Dashboard
              </Button>
              <Button onClick={() => setShowAddModal(true)}>
                + Add Family Member
              </Button>
            </div>
          </div>

          {/* Empty State */}
          {members.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <div className="text-6xl mb-4">🌳</div>
                <h3 className="text-xl font-semibold mb-2">No family members yet</h3>
                <p className="text-slate-600 mb-6">
                  Start building your family tree by adding yourself as the first member
                </p>
                <Button onClick={() => setShowAddModal(true)}>
                  Add Your First Member
                </Button>
              </CardContent>
            </Card>
          ) : (
            /* Members Grid */
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {members.map((member) => (
                <Card key={member.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-2xl">
                          {member.photoUrl ? (
                            <img
                              src={member.photoUrl}
                              alt={member.name}
                              className="h-12 w-12 rounded-full object-cover"
                            />
                          ) : (
                            getGenderIcon(member.gender)
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {member.name}
                            {member.isPrimary && (
                              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-normal">
                                ⭐ Primary
                              </span>
                            )}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            {member.gender || 'Gender not specified'}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-slate-600">
                        <strong>Born:</strong> {formatDate(member.dob)}
                      </p>
                      {member.location && (
                        <p className="text-sm text-slate-600">
                          <strong>Location:</strong> {member.location}
                        </p>
                      )}
                    </div>
                    {member.bio && (
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {member.bio}
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-2">
                      {getPrivacyBadge(member.privacyLevel)}
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingMember(member)}
                        className="flex-1"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(member.id)}
                        disabled={deletingId === member.id}
                        className="flex-1 text-red-600 hover:text-red-700"
                      >
                        {deletingId === member.id ? 'Deleting...' : 'Delete'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          {members.length > 0 && (
            <div className="mt-8 bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Next Steps</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <Button
                  variant="outline"
                  onClick={() => router.push('/family/tree')}
                  className="justify-start h-auto py-4"
                >
                  <span className="mr-3 text-2xl">🌳</span>
                  <div className="text-left">
                    <div className="font-semibold">View Family Tree</div>
                    <div className="text-xs text-slate-600">Visualize your family connections</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/family/links')}
                  className="justify-start h-auto py-4"
                >
                  <span className="mr-3 text-2xl">🤝</span>
                  <div className="text-left">
                    <div className="font-semibold">Connect with Relatives</div>
                    <div className="text-xs text-slate-600">Link with other users</div>
                  </div>
                </Button>
              </div>

              {/* Relationship Manager */}
              {members.length >= 2 && (
                <div className="pt-4 border-t">
                  <RelationshipManager
                    members={members.map(m => ({ id: m.id, name: m.name }))}
                    onSuccess={fetchMembers}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Member Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Family Member</DialogTitle>
            <DialogDescription>
              Add a new member to your family tree
            </DialogDescription>
          </DialogHeader>
          <MemberForm
            onSuccess={() => {
              setShowAddModal(false);
              fetchMembers();
            }}
            onCancel={() => setShowAddModal(false)}
            existingMembers={members.map(m => ({ id: m.id, name: m.name }))}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Member Modal */}
      <Dialog open={!!editingMember} onOpenChange={() => setEditingMember(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Family Member</DialogTitle>
            <DialogDescription>
              Update member information
            </DialogDescription>
          </DialogHeader>
          {editingMember && (
            <MemberForm
              member={editingMember}
              onSuccess={() => {
                setEditingMember(null);
                fetchMembers();
              }}
              onCancel={() => setEditingMember(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
