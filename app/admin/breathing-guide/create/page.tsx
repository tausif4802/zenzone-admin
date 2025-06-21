'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AudioUpload } from '@/components/ui/audio-upload';
import { ArrowLeft, Save, Wind } from 'lucide-react';

export default function CreateBreathingGuidePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    serial: '',
    title: '',
    guide: '',
    description: '',
    audioUrl: '',
    duration: 0,
    isFeatured: false,
  });

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

    if (
      !formData.serial ||
      !formData.title ||
      !formData.guide ||
      !formData.description
    ) {
      alert('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/breathing-guides', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/admin/breathing-guide');
      } else {
        alert('Failed to create breathing guide: ' + data.error);
      }
    } catch (error) {
      console.error('Error creating breathing guide:', error);
      alert('Failed to create breathing guide');
    } finally {
      setIsLoading(false);
    }
  };

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
            Create Breathing Guide
          </h1>
          <p className="text-gray-600">
            Create a new breathing exercise or guided meditation
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
                {/* Serial */}
                <div className="space-y-2">
                  <Label htmlFor="serial">Serial Number *</Label>
                  <Input
                    id="serial"
                    name="serial"
                    type="number"
                    placeholder="Enter unique serial number (1, 2, 3...)"
                    value={formData.serial}
                    onChange={handleInputChange}
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Enter a unique serial number for this guide (e.g., 1, 2,
                    3...)
                  </p>
                </div>

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
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Create Guide</span>
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
                {formData.serial && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Serial:</span>
                    <span className="font-medium">#{formData.serial}</span>
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
