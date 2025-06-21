'use client';

import { useUploadThing } from '@/lib/uploadthing-hooks';
import { useState } from 'react';
import { Button } from './button';
import { Upload, X, Music, Play, Pause } from 'lucide-react';

interface AudioUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove: () => void;
  onDurationChange?: (duration: number) => void;
}

export function AudioUpload({
  value,
  onChange,
  onRemove,
  onDurationChange,
}: AudioUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const { startUpload } = useUploadThing('breathingGuideAudioUploader', {
    onClientUploadComplete: (res: any) => {
      if (res?.[0]?.url) {
        onChange(res[0].url);
        // Load audio to get duration
        const newAudio = new Audio(res[0].url);
        newAudio.addEventListener('loadedmetadata', () => {
          if (onDurationChange) {
            onDurationChange(Math.round(newAudio.duration));
          }
        });
      }
      setIsUploading(false);
    },
    onUploadError: (error: any) => {
      console.error('Upload failed:', error);
      setIsUploading(false);
    },
  });

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      startUpload([file]);
    }
  };

  const handlePlayPause = () => {
    if (!value) return;

    if (!audio) {
      const newAudio = new Audio(value);
      newAudio.addEventListener('ended', () => setIsPlaying(false));
      setAudio(newAudio);
      newAudio.play();
      setIsPlaying(true);
    } else {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play();
        setIsPlaying(true);
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (value) {
    return (
      <div className="relative w-full">
        <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Music className="h-6 w-6 text-blue-600" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                Audio File Uploaded
              </p>
              <p className="text-sm text-gray-500">
                Click play to preview the audio
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePlayPause}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>

              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={onRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Audio element for browser controls */}
          {value && (
            <audio
              controls
              className="w-full mt-4"
              src={value}
              onLoadedMetadata={(e) => {
                const target = e.target as HTMLAudioElement;
                if (onDurationChange) {
                  onDurationChange(Math.round(target.duration));
                }
              }}
            >
              Your browser does not support the audio element.
            </audio>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <label
        htmlFor="audio-upload"
        className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          {isUploading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          ) : (
            <Music className="w-8 h-8 mb-4 text-gray-500" />
          )}
          <p className="mb-2 text-sm text-gray-500">
            {isUploading ? (
              <span>Uploading...</span>
            ) : (
              <span>
                <span className="font-semibold">Click to upload</span> or drag
                and drop
              </span>
            )}
          </p>
          <p className="text-xs text-gray-500">MP3, WAV, M4A up to 8MB</p>
        </div>
        <input
          id="audio-upload"
          type="file"
          className="hidden"
          accept="audio/*"
          onChange={handleUpload}
          disabled={isUploading}
        />
      </label>
    </div>
  );
}
