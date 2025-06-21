'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Star,
  Wind,
  Music,
  Clock,
  Hash,
  Calendar,
} from 'lucide-react';
import type { BreathingGuide } from '@/lib/db/schema';

export default function BreathingGuideDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [guide, setGuide] = useState<BreathingGuide | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setGuide(data.guide);
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

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this breathing guide?'))
      return;

    try {
      const response = await fetch(`/api/breathing-guides/${params.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/admin/breathing-guide');
      } else {
        console.error('Failed to delete breathing guide');
        alert('Failed to delete breathing guide');
      }
    } catch (error) {
      console.error('Error deleting breathing guide:', error);
      alert('Error deleting breathing guide');
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
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
          <div className="space-y-6">
            <Card className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !guide) {
    return (
      <div className="space-y-6">
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
            Breathing Guide Not Found
          </h1>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <Wind className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Guide Not Found
            </h3>
            <p className="text-gray-600 mb-4">
              {error ||
                'The breathing guide you are looking for does not exist or has been deleted.'}
            </p>
            <Button onClick={() => router.push('/admin/breathing-guide')}>
              Back to Breathing Guides
            </Button>
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
            onClick={() => router.back()}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {guide.title}
              </h1>
              <Badge className="bg-blue-100 text-blue-800">
                <Hash className="h-3 w-3 mr-1" />#{guide.serial}
              </Badge>
              {guide.isFeatured && (
                <Badge className="bg-yellow-500">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>
            <p className="text-gray-600">{guide.description}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() =>
              router.push(`/admin/breathing-guide/${guide.id}/edit`)
            }
            className="flex items-center space-x-2"
          >
            <Edit className="h-4 w-4" />
            <span>Edit</span>
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            className="flex items-center space-x-2"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Audio Player */}
          {guide.audioUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Music className="h-5 w-5" />
                  <span>Audio Guide</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-6 rounded-lg text-white">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <Music className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{guide.title}</h3>
                      <p className="text-white/80 text-sm">
                        {guide.duration
                          ? formatDuration(guide.duration)
                          : 'Audio guide'}
                      </p>
                    </div>
                  </div>
                  <audio controls className="w-full" src={guide.audioUrl}>
                    Your browser does not support the audio element.
                  </audio>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Guide Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Wind className="h-5 w-5" />
                <span>Breathing Instructions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-gray max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {guide.guide}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Guide Information */}
          <Card>
            <CardHeader>
              <CardTitle>Guide Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 flex items-center space-x-1">
                  <Hash className="h-4 w-4" />
                  <span>Serial</span>
                </span>
                <Badge variant="outline">#{guide.serial}</Badge>
              </div>

              {guide.duration && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>Duration</span>
                  </span>
                  <span className="text-sm font-medium">
                    {formatDuration(guide.duration)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Created</span>
                </span>
                <span className="text-sm">
                  {new Date(guide.createdAt).toLocaleDateString()}
                </span>
              </div>

              {guide.updatedAt !== guide.createdAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Updated</span>
                  <span className="text-sm">
                    {new Date(guide.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Status</span>
                <div className="flex items-center space-x-2">
                  {guide.isFeatured && (
                    <Badge className="bg-yellow-500 text-xs">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                  {guide.isDeleted ? (
                    <Badge variant="destructive" className="text-xs">
                      Deleted
                    </Badge>
                  ) : (
                    <Badge variant="default" className="text-xs bg-green-500">
                      Active
                    </Badge>
                  )}
                </div>
              </div>
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
                onClick={() =>
                  router.push(`/admin/breathing-guide/${guide.id}/edit`)
                }
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Guide
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push('/admin/breathing-guide/create')}
              >
                <Wind className="h-4 w-4 mr-2" />
                Create New Guide
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-red-700"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Guide
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
