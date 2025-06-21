'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ConfirmationModal } from '@/components/ui/modal';
import {
  Users,
  Search,
  Eye,
  Edit,
  Trash2,
  Crown,
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Calendar,
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

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    regular: 0,
    premium: 0,
  });

  // Modal state for status change confirmation
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    userId: number | null;
    newStatus: string;
    userName: string;
    currentStatus: string;
  }>({
    isOpen: false,
    userId: null,
    newStatus: '',
    userName: '',
    currentStatus: '',
  });
  const [statusChanging, setStatusChanging] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, statusFilter, roleFilter]);

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      if (roleFilter) params.append('role', roleFilter);

      const response = await fetch(`/api/users?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setUsers(data.users);
        // Calculate stats from all users (not filtered)
        if (!searchTerm && !statusFilter && !roleFilter) {
          setStats({
            total: data.users.length,
            admins: data.users.filter((user: User) => user.role === 'admin')
              .length,
            regular: data.users.filter(
              (user: User) => user.status === 'regular'
            ).length,
            premium: data.users.filter(
              (user: User) => user.status === 'premium'
            ).length,
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const openStatusModal = (
    userId: number,
    newStatus: string,
    userName: string,
    currentStatus: string
  ) => {
    setStatusModal({
      isOpen: true,
      userId,
      newStatus,
      userName,
      currentStatus,
    });
  };

  const closeStatusModal = () => {
    setStatusModal({
      isOpen: false,
      userId: null,
      newStatus: '',
      userName: '',
      currentStatus: '',
    });
  };

  const handleStatusChange = async () => {
    if (!statusModal.userId) return;

    setStatusChanging(true);
    try {
      const response = await fetch(`/api/users/${statusModal.userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: statusModal.newStatus }),
      });

      if (response.ok) {
        fetchUsers(); // Refresh the list
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

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchUsers(); // Refresh the list
      } else {
        console.error('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength
      ? text.substring(0, maxLength) + '...'
      : text;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Users</h1>
            <p className="text-gray-600">
              Manage user accounts and permissions
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">Manage user accounts and permissions</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Admins</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.admins}
                </p>
              </div>
              <UserIcon className="h-6 w-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Regular</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.regular}
                </p>
              </div>
              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Premium</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.premium}
                </p>
              </div>
              <Crown className="h-6 w-6 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Status</option>
          <option value="regular">Regular</option>
          <option value="premium">Premium</option>
        </select>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
      </div>

      {/* User Cards */}
      {users.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No users found
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter || roleFilter
                ? 'Try adjusting your search or filters to find users.'
                : 'No users have been registered yet.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {users.map((user) => (
            <Card
              key={user.id}
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* User Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 text-white relative">
                <div className="flex items-center justify-center h-16">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <UserIcon className="h-6 w-6" />
                  </div>
                </div>
                <div className="absolute top-2 right-2">
                  <Badge
                    className={`${
                      roleColors[user.role as keyof typeof roleColors]
                    } text-xs`}
                  >
                    {user.role}
                  </Badge>
                </div>
                <div className="absolute top-2 left-2">
                  <Badge
                    className={`${
                      statusColors[user.status as keyof typeof statusColors]
                    } text-xs`}
                  >
                    {user.status === 'premium' && (
                      <Crown className="h-3 w-3 mr-1" />
                    )}
                    {user.status}
                  </Badge>
                </div>
              </div>

              {/* User Content */}
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg line-clamp-1">
                      {user.name}
                    </h3>
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Mail className="h-3 w-3" />
                      <span className="line-clamp-1">{user.email}</span>
                    </div>
                  </div>

                  {/* User Details */}
                  <div className="space-y-2 text-sm">
                    {user.phone && (
                      <div className="flex items-center space-x-1 text-gray-600">
                        <Phone className="h-3 w-3" />
                        <span>{user.phone}</span>
                      </div>
                    )}

                    {user.address && (
                      <div className="flex items-center space-x-1 text-gray-600">
                        <MapPin className="h-3 w-3" />
                        <span className="line-clamp-1">
                          {truncateText(user.address, 30)}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center space-x-1 text-gray-500 text-xs">
                      <Calendar className="h-3 w-3" />
                      <span>
                        Joined {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Status Change */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-700">
                      Change Status:
                    </p>
                    <div className="flex space-x-1">
                      <Button
                        variant={
                          user.status === 'regular' ? 'default' : 'outline'
                        }
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() =>
                          openStatusModal(
                            user.id,
                            'regular',
                            user.name,
                            user.status
                          )
                        }
                        disabled={user.status === 'regular'}
                      >
                        Regular
                      </Button>
                      <Button
                        variant={
                          user.status === 'premium' ? 'default' : 'outline'
                        }
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() =>
                          openStatusModal(
                            user.id,
                            'premium',
                            user.name,
                            user.status
                          )
                        }
                        disabled={user.status === 'premium'}
                      >
                        <Crown className="h-3 w-3 mr-1" />
                        Premium
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/admin/users/${user.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        router.push(`/admin/users/${user.id}/edit`)
                      }
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Status Change Confirmation Modal */}
      <ConfirmationModal
        isOpen={statusModal.isOpen}
        onClose={closeStatusModal}
        onConfirm={handleStatusChange}
        title="Change User Status"
        message={`Are you sure you want to change ${statusModal.userName}'s status from ${statusModal.currentStatus} to ${statusModal.newStatus}?`}
        confirmText={`Change to ${statusModal.newStatus}`}
        cancelText="Cancel"
        variant={statusModal.newStatus === 'premium' ? 'warning' : 'default'}
        loading={statusChanging}
      />
    </div>
  );
}
