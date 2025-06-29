'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { compressImage } from '@/utils/imageUtils';

interface ImageUploadZoneProps {
  onImageSelect: (file: File) => void;
  selectedImage: File | null;
  onClearImage: () => void;
  disabled?: boolean;
}

export function ImageUploadZone({
  onImageSelect,
  selectedImage,
  onClearImage,
  disabled = false,
}: ImageUploadZoneProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const originalFile = acceptedFiles[0];
      if (originalFile) {
        // Compress image before selecting
        compressImage(originalFile)
          .then((compressedFile) => {
            onImageSelect(compressedFile);
            const reader = new FileReader();
            reader.onload = (e) => {
              setPreview(e.target?.result as string);
            };
            reader.readAsDataURL(compressedFile);
          })
          .catch((error) => {
            console.error('Error compressing image:', error);
            alert('Không thể xử lý ảnh. Vui lòng thử ảnh khác.');
          });
      }
    },
    [onImageSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
    },
    maxFiles: 1,
    disabled,
  });

  const handleClear = () => {
    onClearImage();
    setPreview(null);
  };

  React.useEffect(() => {
    if (!selectedImage) {
      setPreview(null);
    }
  }, [selectedImage]);

  return (
    <div className="w-full">
      {!selectedImage ? (
        <div
          {...getRootProps()}
          className={cn(
            'relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200',
            'hover:border-primary/50 hover:bg-primary/5',
            isDragActive
              ? 'border-primary bg-primary/10 scale-[1.02]'
              : 'border-muted-foreground/25',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <input {...getInputProps()} />
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">
                {isDragActive ? 'Thả hình ảnh vào đây' : 'Tải lên hình ảnh'}
              </h3>
              <p className="text-sm text-muted-foreground">
                Kéo thả hoặc nhấp để chọn • JPG, PNG, GIF, WebP • Tự động nén
              </p>
              <p className="text-xs text-muted-foreground">
                Ảnh sẽ được tự động nén để tối ưu tốc độ xử lý
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden bg-muted">
          <div className="absolute top-2 right-2 z-10">
            <Button
              onClick={handleClear}
              size="icon"
              variant="destructive"
              className="h-8 w-8"
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {preview ? (
            <img
              src={preview}
              alt="Selected image"
              className="w-full h-auto max-h-96 object-contain"
            />
          ) : (
            <div className="flex items-center justify-center h-48">
              <ImageIcon className="w-12 h-12 text-muted-foreground" />
            </div>
          )}
          <div className="p-4 bg-background/95 backdrop-blur-sm">
            <p className="text-sm font-medium truncate">{selectedImage.name}</p>
            <p className="text-xs text-muted-foreground">
              {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>
      )}
    </div>
  );
}