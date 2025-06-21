'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { ImageUpload } from '@/components/ui/image-upload';
import { ArrowLeft, Save, Star } from 'lucide-react';
import { toast } from 'sonner';
import type { Blog } from '@/lib/db/schema';

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams();
  const blogId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [blog, setBlog] = useState<Blog | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    body: '',
    imageUrl: '',
    isFeatured: false,
  });

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
        setFormData({
          title: data.blog.title,
          description: data.blog.description,
          body: data.blog.body,
          imageUrl: data.blog.imageUrl || '',
          isFeatured: data.blog.isFeatured,
        });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.body) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/blogs/${blogId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Blog updated successfully!');
        router.push(`/admin/blogs/${blogId}`);
      } else {
        toast.error(data.error || 'Failed to update blog');
      }
    } catch (error) {
      console.error('Error updating blog:', error);
      toast.error('Failed to update blog');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
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
            <h1 className="text-3xl font-bold text-gray-900">Edit Blog</h1>
            <p className="text-gray-600">Update your blog content</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() =>
              handleInputChange('isFeatured', !formData.isFeatured)
            }
            className={
              formData.isFeatured ? 'bg-yellow-50 border-yellow-200' : ''
            }
          >
            <Star
              className={`h-4 w-4 mr-2 ${
                formData.isFeatured ? 'fill-yellow-400 text-yellow-400' : ''
              }`}
            />
            {formData.isFeatured ? 'Featured' : 'Make Featured'}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Blog Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter blog title..."
                  className="text-lg"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange('description', e.target.value)
                  }
                  placeholder="Enter a brief description..."
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              {/* Rich Text Editor */}
              <div className="space-y-2">
                <Label>Content *</Label>
                <RichTextEditor
                  content={formData.body}
                  onChange={(html) => handleInputChange('body', html)}
                  placeholder="Start writing your blog content..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Blog Info */}
          <Card>
            <CardHeader>
              <CardTitle>Blog Information</CardTitle>
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
                <Badge
                  variant={formData.isFeatured ? 'default' : 'secondary'}
                  className={formData.isFeatured ? 'bg-yellow-500' : ''}
                >
                  {formData.isFeatured ? 'Featured' : 'Regular'}
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
            </CardContent>
          </Card>

          {/* Image Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Blog Image</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload
                value={formData.imageUrl}
                onChange={(url) => handleInputChange('imageUrl', url)}
                onRemove={() => handleInputChange('imageUrl', '')}
              />
              <p className="text-sm text-gray-500 mt-2">
                Upload an engaging image for your blog post. Recommended size:
                1200x630px.
              </p>
            </CardContent>
          </Card>

          {/* Preview Card */}
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg line-clamp-2">
                  {formData.title || 'Your blog title will appear here'}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-3">
                  {formData.description ||
                    'Your blog description will appear here'}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                  <span>{new Date().toLocaleDateString()}</span>
                  {formData.isFeatured && (
                    <Badge className="bg-yellow-500 text-xs">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
