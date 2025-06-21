'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Wind,
  Users,
  Activity,
  TrendingUp,
  Eye,
  Search,
  Calendar,
  Crown,
  Hash,
  Star,
  Clock,
  Plus,
} from 'lucide-react';
import type { Blog } from '@/lib/db/schema';
import type { BreathingGuide } from '@/lib/db/schema';
import type { User } from '@/lib/db/schema';

interface DashboardStats {
  totalUsers: number;
  totalBlogs: number;
  totalBreathingGuides: number;
  featuredBlogs: number;
  featuredBreathingGuides: number;
  premiumUsers: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalBlogs: 0,
    totalBreathingGuides: 0,
    featuredBlogs: 0,
    featuredBreathingGuides: 0,
    premiumUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  // Recent content states
  const [recentBlogs, setRecentBlogs] = useState<Blog[]>([]);
  const [recentBreathingGuides, setRecentBreathingGuides] = useState<
    BreathingGuide[]
  >([]);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);

  // Search states
  const [blogSearch, setBlogSearch] = useState('');
  const [breathingGuideSearch, setBreathingGuideSearch] = useState('');
  const [searchedBlogs, setSearchedBlogs] = useState<Blog[]>([]);
  const [searchedBreathingGuides, setSearchedBreathingGuides] = useState<
    BreathingGuide[]
  >([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (blogSearch) {
      searchBlogs();
    } else {
      setSearchedBlogs([]);
    }
  }, [blogSearch]);

  useEffect(() => {
    if (breathingGuideSearch) {
      searchBreathingGuides();
    } else {
      setSearchedBreathingGuides([]);
    }
  }, [breathingGuideSearch]);

  const fetchDashboardData = async () => {
    try {
      const [usersRes, blogsRes, breathingGuidesRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/blogs'),
        fetch('/api/breathing-guides'),
      ]);

      const [usersData, blogsData, breathingGuidesData] = await Promise.all([
        usersRes.json(),
        blogsRes.json(),
        breathingGuidesRes.json(),
      ]);

      if (
        usersData.success &&
        blogsData.success &&
        breathingGuidesData.success
      ) {
        const users = usersData.users || [];
        const blogs = blogsData.blogs || [];
        const breathingGuides = breathingGuidesData.breathingGuides || [];

        setStats({
          totalUsers: users.length,
          totalBlogs: blogs.length,
          totalBreathingGuides: breathingGuides.length,
          featuredBlogs: blogs.filter((blog: Blog) => blog.isFeatured).length,
          featuredBreathingGuides: breathingGuides.filter(
            (guide: BreathingGuide) => guide.isFeatured
          ).length,
          premiumUsers: users.filter((user: User) => user.status === 'premium')
            .length,
        });

        // Set recent content (last 5 items)
        setRecentBlogs(blogs.slice(0, 5));
        setRecentBreathingGuides(breathingGuides.slice(0, 5));
        setRecentUsers(users.slice(0, 5));
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchBlogs = async () => {
    try {
      const response = await fetch(
        `/api/blogs?search=${encodeURIComponent(blogSearch)}`
      );
      const data = await response.json();
      if (data.success) {
        setSearchedBlogs(data.blogs.slice(0, 5)); // Limit to 5 results
      }
    } catch (error) {
      console.error('Failed to search blogs:', error);
    }
  };

  const searchBreathingGuides = async () => {
    try {
      const response = await fetch(
        `/api/breathing-guides?search=${encodeURIComponent(
          breathingGuideSearch
        )}`
      );
      const data = await response.json();
      if (data.success) {
        setSearchedBreathingGuides(data.breathingGuides.slice(0, 5)); // Limit to 5 results
      }
    } catch (error) {
      console.error('Failed to search breathing guides:', error);
    }
  };

  const overviewCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      description: `${stats.premiumUsers} premium users`,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      href: '/admin/users',
    },
    {
      title: 'Published Blogs',
      value: stats.totalBlogs,
      description: `${stats.featuredBlogs} featured`,
      icon: BookOpen,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      href: '/admin/blogs',
    },
    {
      title: 'Breathing Guides',
      value: stats.totalBreathingGuides,
      description: `${stats.featuredBreathingGuides} featured`,
      icon: Wind,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      href: '/admin/breathing-guide',
    },
    {
      title: 'Premium Users',
      value: stats.premiumUsers,
      description: `${
        Math.round((stats.premiumUsers / stats.totalUsers) * 100) || 0
      }% of total`,
      icon: Crown,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      href: '/admin/users?status=premium',
    },
  ];

  const quickActions = [
    {
      title: 'Create New Blog',
      description: 'Write a new blog post',
      icon: BookOpen,
      href: '/admin/blogs/create',
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      title: 'Add Breathing Guide',
      description: 'Create a new breathing guide',
      icon: Wind,
      href: '/admin/breathing-guide/create',
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      title: 'Manage Users',
      description: 'View and manage user accounts',
      icon: Users,
      href: '/admin/users',
      color: 'bg-green-500 hover:bg-green-600',
    },
  ];

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to ZenZone Admin Panel</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to ZenZone Admin Panel</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => router.push('/admin/blogs/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Blog
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/admin/breathing-guide/create')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Guide
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.title}
              className="relative overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push(card.href)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {card.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {card.value.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">{card.description}</p>
                  </div>
                  <div className={`p-3 rounded-full ${card.bgColor}`}>
                    <Icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Blog Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Search Blogs</span>
            </CardTitle>
            <CardDescription>Find and manage blog posts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search blogs by title or content..."
                value={blogSearch}
                onChange={(e) => setBlogSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {blogSearch && searchedBlogs.length > 0 && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {searchedBlogs.map((blog) => (
                  <div
                    key={blog.id}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => router.push(`/admin/blogs/${blog.id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm line-clamp-1">
                          {blog.title}
                        </h4>
                        <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                          {blog.description}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {formatDate(blog.createdAt)}
                          </span>
                          {blog.isFeatured && (
                            <Badge variant="secondary" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {blogSearch && searchedBlogs.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No blogs found
              </p>
            )}

            {!blogSearch && (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 mb-2">Recent Blogs</p>
                <div className="space-y-2">
                  {recentBlogs.slice(0, 3).map((blog) => (
                    <div
                      key={blog.id}
                      className="p-2 text-left cursor-pointer hover:bg-gray-50 rounded"
                      onClick={() => router.push(`/admin/blogs/${blog.id}`)}
                    >
                      <p className="text-sm font-medium line-clamp-1">
                        {blog.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(blog.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Breathing Guide Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wind className="h-5 w-5" />
              <span>Search Breathing Guides</span>
            </CardTitle>
            <CardDescription>Find and manage breathing guides</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search guides by title or serial..."
                value={breathingGuideSearch}
                onChange={(e) => setBreathingGuideSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {breathingGuideSearch && searchedBreathingGuides.length > 0 && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {searchedBreathingGuides.map((guide) => (
                  <div
                    key={guide.id}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() =>
                      router.push(`/admin/breathing-guide/${guide.id}`)
                    }
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            <Hash className="h-3 w-3 mr-1" />
                            {guide.serial}
                          </Badge>
                          {guide.isFeatured && (
                            <Badge variant="secondary" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                        </div>
                        <h4 className="font-medium text-sm line-clamp-1">
                          {guide.title}
                        </h4>
                        <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                          {guide.description}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {formatDate(guide.createdAt)}
                          </span>
                          {guide.duration && (
                            <>
                              <Clock className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                {formatDuration(guide.duration)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {breathingGuideSearch && searchedBreathingGuides.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No breathing guides found
              </p>
            )}

            {!breathingGuideSearch && (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 mb-2">
                  Recent Breathing Guides
                </p>
                <div className="space-y-2">
                  {recentBreathingGuides.slice(0, 3).map((guide) => (
                    <div
                      key={guide.id}
                      className="p-2 text-left cursor-pointer hover:bg-gray-50 rounded"
                      onClick={() =>
                        router.push(`/admin/breathing-guide/${guide.id}`)
                      }
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          <Hash className="h-3 w-3 mr-1" />
                          {guide.serial}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium line-clamp-1">
                        {guide.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(guide.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Quick Actions</span>
            </CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.title}
                  variant="outline"
                  className="w-full justify-start h-auto p-4"
                  onClick={() => router.push(action.href)}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2 rounded-lg ${action.color} text-white`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">{action.title}</p>
                      <p className="text-sm text-gray-500">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </Button>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Recent Users</span>
            </CardTitle>
            <CardDescription>Latest registered users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => router.push(`/admin/users/${user.id}`)}
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {user.status === 'premium' && (
                      <Crown className="h-4 w-4 text-yellow-500" />
                    )}
                    <p className="text-xs text-gray-500">
                      {formatDate(user.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
              {recentUsers.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No users found
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
