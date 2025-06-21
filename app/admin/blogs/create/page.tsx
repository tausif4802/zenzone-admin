'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { ImageUpload } from '@/components/ui/image-upload';
import { ArrowLeft, Save, Star } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateBlogPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    body: '',
    imageUrl: '',
    isFeatured: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.body) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Blog created successfully!');
        router.push('/admin/blogs');
      } else {
        toast.error(data.error || 'Failed to create blog');
      }
    } catch (error) {
      console.error('Error creating blog:', error);
      toast.error('Failed to create blog');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

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
            <h1 className="text-3xl font-bold text-gray-900">
              Create New Blog
            </h1>
            <p className="text-gray-600">
              Write engaging content for your audience
            </p>
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
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>{loading ? 'Creating...' : 'Create Blog'}</span>
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
          {/* Featured Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="h-5 w-5" />
                <span>Blog Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Featured Blog</span>
                <Badge
                  variant={formData.isFeatured ? 'default' : 'secondary'}
                  className={formData.isFeatured ? 'bg-yellow-500' : ''}
                >
                  {formData.isFeatured ? 'Featured' : 'Regular'}
                </Badge>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Featured blogs will be highlighted and given priority display.
              </p>
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
