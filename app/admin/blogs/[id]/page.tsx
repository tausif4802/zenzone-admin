'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2, Star, Calendar, Eye } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import type { Blog } from '@/lib/db/schema';

export default function BlogDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const blogId = params.id as string;

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (blogId) {
      fetchBlog();
    }
  }, [blogId]);

  const fetchBlog = async () => {
    try {
      const response = await fetch(`/api/blogs/${blogId}`);
      const data = await response.json();

      if (data.success) {
        setBlog(data.blog);
      } else {
        toast.error('Blog not found');
        router.push('/admin/blogs');
      }
    } catch (error) {
      console.error('Error fetching blog:', error);
      toast.error('Failed to fetch blog');
      router.push('/admin/blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        'Are you sure you want to delete this blog? This action cannot be undone.'
      )
    ) {
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(`/api/blogs/${blogId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Blog deleted successfully');
        router.push('/admin/blogs');
      } else {
        toast.error('Failed to delete blog');
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast.error('Failed to delete blog');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" disabled>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-48 mt-2 animate-pulse"></div>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Blog not found
        </h2>
        <Button onClick={() => router.push('/admin/blogs')}>
          Back to Blogs
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{blog.title}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>
                  Created: {new Date(blog.createdAt).toLocaleDateString()}
                </span>
              </div>
              {blog.updatedAt !== blog.createdAt && (
                <div className="flex items-center space-x-1">
                  <Edit className="h-4 w-4" />
                  <span>
                    Updated: {new Date(blog.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {blog.isFeatured && (
            <Badge className="bg-yellow-500">
              <Star className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          )}
          {blog.isDeleted && <Badge variant="destructive">Deleted</Badge>}
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/blogs/${blog.id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      {/* Blog Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              {/* Blog Image */}
              {blog.imageUrl && (
                <div className="aspect-video relative bg-gray-200 rounded-t-lg overflow-hidden">
                  <Image
                    src={blog.imageUrl}
                    alt={blog.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Blog Content */}
              <div className="p-6 space-y-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Description
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    {blog.description}
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Content
                  </h2>
                  <div
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: blog.body }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Blog Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <span>Blog Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Status
                </span>
                <Badge variant={blog.isDeleted ? 'destructive' : 'default'}>
                  {blog.isDeleted ? 'Deleted' : 'Published'}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Featured
                </span>
                <Badge variant={blog.isFeatured ? 'default' : 'secondary'}>
                  {blog.isFeatured ? 'Yes' : 'No'}
                </Badge>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium text-gray-600">
                  Created
                </span>
                <p className="text-sm text-gray-900">
                  {new Date(blog.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium text-gray-600">
                  Last Updated
                </span>
                <p className="text-sm text-gray-900">
                  {new Date(blog.updatedAt).toLocaleString()}
                </p>
              </div>

              {blog.deletedAt && (
                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-600">
                    Deleted At
                  </span>
                  <p className="text-sm text-gray-900">
                    {new Date(blog.deletedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push(`/admin/blogs/${blog.id}/edit`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Blog
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleDelete}
                disabled={deleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deleting ? 'Deleting...' : 'Delete Blog'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
