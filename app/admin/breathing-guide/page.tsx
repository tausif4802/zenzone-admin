'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Wind,
  Plus,
  Eye,
  Edit,
  Trash2,
  Star,
  Music,
  Clock,
  Hash,
} from 'lucide-react';
import type { BreathingGuide } from '@/lib/db/schema';

export default function BreathingGuidePage() {
  const router = useRouter();
  const [guides, setGuides] = useState<BreathingGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    featured: 0,
  });

  useEffect(() => {
    fetchGuides();
  }, []);

  const fetchGuides = async () => {
    try {
      const response = await fetch('/api/breathing-guides');
      const data = await response.json();
      if (data.success && data.breathingGuides) {
        setGuides(data.breathingGuides);
        setStats({
          total: data.breathingGuides.length,
          featured: data.breathingGuides.filter(
            (guide: BreathingGuide) => guide.isFeatured && !guide.isDeleted
          ).length,
        });
      } else {
        // Handle case where API returns success but no data
        setGuides([]);
        setStats({
          total: 0,
          featured: 0,
        });
      }
    } catch (error) {
      console.error('Failed to fetch breathing guides:', error);
      setGuides([]);
      setStats({
        total: 0,
        featured: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (guideId: number) => {
    if (!confirm('Are you sure you want to delete this breathing guide?'))
      return;

    try {
      const response = await fetch(`/api/breathing-guides/${guideId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchGuides(); // Refresh the list
      } else {
        console.error('Failed to delete breathing guide');
      }
    } catch (error) {
      console.error('Error deleting breathing guide:', error);
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
            <h1 className="text-3xl font-bold text-gray-900">
              Breathing Guide
            </h1>
            <p className="text-gray-600">
              Manage breathing exercises and guides
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
          <h1 className="text-3xl font-bold text-gray-900">Breathing Guide</h1>
          <p className="text-gray-600">Manage breathing exercises and guides</p>
        </div>
        <Button
          className="flex items-center space-x-2"
          onClick={() => router.push('/admin/breathing-guide/create')}
        >
          <Plus className="h-4 w-4" />
          <span>Create New Guide</span>
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Guides
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
              <Wind className="h-6 w-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Featured</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.featured}
                </p>
              </div>
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Breathing Guide Cards */}
      {guides && guides.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Wind className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No breathing guides yet
            </h3>
            <p className="text-gray-600 mb-4">
              Start creating breathing exercises and guided meditations for your
              users.
            </p>
            <Button
              onClick={() => router.push('/admin/breathing-guide/create')}
            >
              Create Your First Guide
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {guides.map((guide) => (
            <Card
              key={guide.id}
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Guide Header */}
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-4 text-white relative">
                <div className="flex items-center justify-center h-16">
                  <Wind className="h-8 w-8" />
                </div>
                {guide.isFeatured && (
                  <Badge className="absolute top-2 right-2 bg-yellow-500">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
                <div className="absolute top-2 left-2">
                  <Badge className="bg-white/20 text-white">
                    <Hash className="h-3 w-3 mr-1" />
                    {guide.serial}
                  </Badge>
                </div>
              </div>

              {/* Guide Content */}
              <CardContent className="p-4">
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg line-clamp-2">
                    {guide.title}
                  </h3>

                  <p className="text-sm text-gray-600 line-clamp-2">
                    {truncateText(guide.description, 100)}
                  </p>

                  {/* Guide Details */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1">
                      <Hash className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">
                        Serial: {guide.serial}
                      </span>
                    </div>

                    {guide.duration && (
                      <div className="flex items-center space-x-1 text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>{formatDuration(guide.duration)}</span>
                      </div>
                    )}
                  </div>

                  {guide.audioUrl && (
                    <div className="flex items-center space-x-1 text-sm text-blue-600">
                      <Music className="h-4 w-4" />
                      <span>Audio available</span>
                    </div>
                  )}

                  <div className="text-xs text-gray-500">
                    Created: {new Date(guide.createdAt).toLocaleDateString()}
                    {guide.isDeleted && (
                      <Badge variant="destructive" className="ml-2 text-xs">
                        Deleted
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      router.push(`/admin/breathing-guide/${guide.id}`)
                    }
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        router.push(`/admin/breathing-guide/${guide.id}/edit`)
                      }
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(guide.id)}
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
    </div>
  );
}
