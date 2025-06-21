'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmationModal } from '@/components/ui/modal';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Crown,
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  BookOpen,
  Headphones,
} from 'lucide-react';
import type { User } from '@/lib/db/schema';

const statusColors = {
  regular: 'bg-gray-100 text-gray-800',
  premium: 'bg-yellow-100 text-yellow-800',
};

const roleColors = {
  admin: 'bg-blue-100 text-blue-800',
  user: 'bg-green-100 text-green-800',
};

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal state for status change confirmation
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    newStatus: string;
    currentStatus: string;
  }>({
    isOpen: false,
    newStatus: '',
    currentStatus: '',
  });
  const [statusChanging, setStatusChanging] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchUser();
    }
  }, [userId]);

  const fetchUser = async () => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      const data = await response.json();

      if (data.success) {
        setUser(data.user);
      } else {
        console.error('Failed to fetch user:', data.error);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const openStatusModal = (newStatus: string, currentStatus: string) => {
    setStatusModal({
      isOpen: true,
      newStatus,
      currentStatus,
    });
  };

  const closeStatusModal = () => {
    setStatusModal({
      isOpen: false,
      newStatus: '',
      currentStatus: '',
    });
  };

  const handleStatusChange = async () => {
    if (!user) return;

    setStatusChanging(true);
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: statusModal.newStatus }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        closeStatusModal();
      } else {
        console.error('Failed to update user status');
        alert('Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Error updating user status');
    } finally {
      setStatusChanging(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!user || !confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/admin/users');
      } else {
        console.error('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-32 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-24 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/admin/users')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Users</span>
          </Button>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              User not found
            </h3>
            <p className="text-gray-600">
              The user you're looking for doesn't exist.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/admin/users')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Users</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-gray-600">User Profile</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/users/${userId}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit User
          </Button>
          <Button variant="destructive" onClick={handleDeleteUser}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete User
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Profile Information</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge
                    className={roleColors[user.role as keyof typeof roleColors]}
                  >
                    {user.role}
                  </Badge>
                  <Badge
                    className={
                      statusColors[user.status as keyof typeof statusColors]
                    }
                  >
                    {user.status === 'premium' && (
                      <Crown className="h-3 w-3 mr-1" />
                    )}
                    {user.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* User Avatar and Basic Info */}
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white">
                  <UserIcon className="h-10 w-10" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {user.name}
                  </h2>
                  <div className="flex items-center space-x-1 text-gray-600 mt-1">
                    <Mail className="h-4 w-4" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-500 text-sm mt-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Joined{' '}
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Contact Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Email
                        </p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                    {user.phone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Phone
                          </p>
                          <p className="text-sm text-gray-600">{user.phone}</p>
                        </div>
                      </div>
                    )}
                    {user.address && (
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Address
                          </p>
                          <p className="text-sm text-gray-600">
                            {user.address}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Account Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Role
                        </p>
                        <Badge
                          className={
                            roleColors[user.role as keyof typeof roleColors]
                          }
                        >
                          {user.role}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Crown className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Status
                        </p>
                        <Badge
                          className={
                            statusColors[
                              user.status as keyof typeof statusColors
                            ]
                          }
                        >
                          {user.status === 'premium' && (
                            <Crown className="h-3 w-3 mr-1" />
                          )}
                          {user.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Member Since
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(user.createdAt).toLocaleDateString(
                            'en-US',
                            {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Information */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Last Read
                    </p>
                    <p className="text-sm text-gray-600">
                      {user.lastRead
                        ? new Date(user.lastRead).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Never'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Headphones className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Last Watched
                    </p>
                    <p className="text-sm text-gray-600">
                      {user.lastWatched
                        ? new Date(user.lastWatched).toLocaleDateString(
                            'en-US',
                            {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )
                        : 'Never'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Management */}
          <Card>
            <CardHeader>
              <CardTitle>Status Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Current Status
                </p>
                <Badge
                  className={`${
                    statusColors[user.status as keyof typeof statusColors]
                  } text-sm`}
                >
                  {user.status === 'premium' && (
                    <Crown className="h-3 w-3 mr-1" />
                  )}
                  {user.status}
                </Badge>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Change Status
                </p>
                <div className="space-y-2">
                  <Button
                    variant={user.status === 'regular' ? 'default' : 'outline'}
                    size="sm"
                    className="w-full"
                    onClick={() => openStatusModal('regular', user.status)}
                    disabled={user.status === 'regular'}
                  >
                    Regular User
                  </Button>
                  <Button
                    variant={user.status === 'premium' ? 'default' : 'outline'}
                    size="sm"
                    className="w-full"
                    onClick={() => openStatusModal('premium', user.status)}
                    disabled={user.status === 'premium'}
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Premium User
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Account Age</span>
                <span className="text-sm font-medium">
                  {Math.floor(
                    (Date.now() - new Date(user.createdAt).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}{' '}
                  days
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Updated</span>
                <span className="text-sm font-medium">
                  {new Date(user.updatedAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">User ID</span>
                <span className="text-sm font-medium">#{user.id}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Status Change Confirmation Modal */}
      <ConfirmationModal
        isOpen={statusModal.isOpen}
        onClose={closeStatusModal}
        onConfirm={handleStatusChange}
        title="Change User Status"
        message={`Are you sure you want to change ${user?.name}'s status from ${statusModal.currentStatus} to ${statusModal.newStatus}?`}
        confirmText={`Change to ${statusModal.newStatus}`}
        cancelText="Cancel"
        variant={statusModal.newStatus === 'premium' ? 'warning' : 'default'}
        loading={statusChanging}
      />
    </div>
  );
}
