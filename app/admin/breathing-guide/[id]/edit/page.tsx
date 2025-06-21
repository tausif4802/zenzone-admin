'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AudioUpload } from '@/components/ui/audio-upload';
import { ArrowLeft, Save, Wind } from 'lucide-react';
import type { BreathingGuide } from '@/lib/db/schema';

const difficulties = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const categories = [
  { value: 'relaxation', label: 'Relaxation' },
  { value: 'focus', label: 'Focus' },
  { value: 'sleep', label: 'Sleep' },
  { value: 'anxiety', label: 'Anxiety Relief' },
  { value: 'energy', label: 'Energy Boost' },
  { value: 'meditation', label: 'Meditation' },
];

export default function EditBreathingGuidePage() {
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    guide: '',
    description: '',
    audioUrl: '',
    duration: 0,
    difficulty: 'beginner',
    category: '',
    isFeatured: false,
  });

  useEffect(() => {
    if (params.id) {
      fetchGuide();
    }
  }, [params.id]);

  const fetchGuide = async () => {
    try {
      const response = await fetch(`/api/breathing-guides/${params.id}`);
      const data = await response.json();

      if (data.success) {
        const guide = data.guide;
        setFormData({
          title: guide.title || '',
          guide: guide.guide || '',
          description: guide.description || '',
          audioUrl: guide.audioUrl || '',
          duration: guide.duration || 0,
          difficulty: guide.difficulty || 'beginner',
          category: guide.category || '',
          isFeatured: guide.isFeatured || false,
        });
      } else {
        setError(data.error || 'Failed to fetch breathing guide');
      }
    } catch (error) {
      console.error('Error fetching breathing guide:', error);
      setError('Failed to fetch breathing guide');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleAudioUpload = (url: string) => {
    setFormData((prev) => ({ ...prev, audioUrl: url }));
  };

  const handleAudioRemove = () => {
    setFormData((prev) => ({ ...prev, audioUrl: '' }));
  };

  const handleDurationChange = (duration: number) => {
    setFormData((prev) => ({ ...prev, duration }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.guide || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/breathing-guides/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        router.push(`/admin/breathing-guide/${params.id}`);
      } else {
        alert('Failed to update breathing guide: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating breathing guide:', error);
      alert('Failed to update breathing guide');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            Error Loading Guide
          </h1>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <Wind className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Failed to Load Guide
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.push('/admin/breathing-guide')}>
              Back to Breathing Guides
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Edit Breathing Guide
          </h1>
          <p className="text-gray-600">
            Update breathing exercise or guided meditation
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Wind className="h-5 w-5" />
                  <span>Guide Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Enter breathing guide title..."
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief description of the breathing guide..."
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Guide Content */}
                <div className="space-y-2">
                  <Label htmlFor="guide">Guide Instructions *</Label>
                  <textarea
                    id="guide"
                    name="guide"
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Detailed breathing instructions and steps..."
                    value={formData.guide}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Category and Difficulty */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty *</Label>
                    <select
                      id="difficulty"
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      {difficulties.map((diff) => (
                        <option key={diff.value} value={diff.value}>
                          {diff.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Featured Toggle */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="isFeatured">Featured Guide</Label>
                </div>
              </CardContent>
            </Card>

            {/* Audio Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Audio Guide</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Upload an optional audio file to accompany this breathing
                    guide
                  </p>
                  <AudioUpload
                    value={formData.audioUrl}
                    onChange={handleAudioUpload}
                    onRemove={handleAudioRemove}
                    onDurationChange={handleDurationChange}
                  />
                  {formData.duration > 0 && (
                    <p className="text-sm text-gray-500">
                      Audio duration: {Math.floor(formData.duration / 60)}:
                      {(formData.duration % 60).toString().padStart(2, '0')}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Update Guide</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Preview Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">
                  {formData.title || 'Guide Title'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {formData.description ||
                    'Guide description will appear here...'}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Difficulty:</span>
                  <span className="capitalize font-medium">
                    {formData.difficulty}
                  </span>
                </div>
                {formData.category && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Category:</span>
                    <span className="font-medium">
                      {
                        categories.find((c) => c.value === formData.category)
                          ?.label
                      }
                    </span>
                  </div>
                )}
                {formData.duration > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Duration:</span>
                    <span className="font-medium">
                      {Math.floor(formData.duration / 60)}:
                      {(formData.duration % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                )}
                {formData.isFeatured && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Status:</span>
                    <span className="text-yellow-600 font-medium">
                      Featured
                    </span>
                  </div>
                )}
              </div>

              {formData.guide && (
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">
                    Instructions Preview:
                  </h4>
                  <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded max-h-32 overflow-y-auto">
                    {formData.guide.substring(0, 200)}
                    {formData.guide.length > 200 && '...'}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
