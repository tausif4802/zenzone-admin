'use client';

import { useUploadThing } from '@/lib/uploadthing-hooks';
import { useState } from 'react';
import { Button } from './button';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove: () => void;
}

export function ImageUpload({ value, onChange, onRemove }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const { startUpload } = useUploadThing('blogImageUploader', {
    onClientUploadComplete: (res: any) => {
      if (res?.[0]?.url) {
        onChange(res[0].url);
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

  if (value) {
    return (
      <div className="relative w-full">
        <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
          <Image src={value} alt="Blog image" fill className="object-cover" />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={onRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <label
        htmlFor="image-upload"
        className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          {isUploading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          ) : (
            <ImageIcon className="w-8 h-8 mb-4 text-gray-500" />
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
          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 4MB</p>
        </div>
        <input
          id="image-upload"
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleUpload}
          disabled={isUploading}
        />
      </label>
    </div>
  );
}
