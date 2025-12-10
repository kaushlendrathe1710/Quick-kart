import { useState, useRef, ChangeEvent } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value?: string;
  onChange: (file: File | null, previewUrl: string | null) => void;
  maxSizeMB?: number;
  recommendedAspectRatio?: string;
  recommendedDimensions?: string;
  acceptedFormats?: string[];
  className?: string;
  disabled?: boolean;
}

/**
 * Reusable Image Upload Component with validation and preview
 *
 * Features:
 * - Image preview with ability to clear
 * - File size validation
 * - File type validation
 * - Displays upload recommendations
 * - Drag and drop support (future enhancement)
 */
export function ImageUpload({
  value,
  onChange,
  maxSizeMB = 1,
  recommendedAspectRatio = '1:1 (Square)',
  recommendedDimensions = '512x512px',
  acceptedFormats = ['JPG', 'PNG', 'WEBP'],
  className,
  disabled = false,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);

    if (!file) {
      return;
    }

    // Validate file type
    const validMimeTypes: Record<string, string> = {
      JPG: 'image/jpeg',
      JPEG: 'image/jpeg',
      PNG: 'image/png',
      WEBP: 'image/webp',
      SVG: 'image/svg+xml',
    };

    const fileExtension = file.name.split('.').pop()?.toUpperCase() || '';
    const isValidType = acceptedFormats.some((format) => {
      const mimeType = validMimeTypes[format];
      return file.type === mimeType || fileExtension === format;
    });

    if (!isValidType) {
      setError(`Invalid file type. Allowed: ${acceptedFormats.join(', ')}`);
      e.target.value = '';
      return;
    }

    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`File size exceeds ${maxSizeMB}MB limit`);
      e.target.value = '';
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const previewUrl = reader.result as string;
      setPreview(previewUrl);
      onChange(file, previewUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleClear = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onChange(null, null);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Upload Area */}
      <div
        className={cn(
          'relative rounded-lg border-2 border-dashed transition-colors',
          preview ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 bg-muted/20',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        {preview ? (
          // Preview
          <div className="relative mx-auto aspect-square w-full max-w-xs p-2">
            <img src={preview} alt="Preview" className="h-full w-full rounded object-contain" />
            {!disabled && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute right-1 top-1 h-8 w-8 rounded-full shadow-md"
                onClick={handleClear}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          // Upload Button
          <div className="flex flex-col items-center justify-center px-4 py-8">
            <div className="mb-3 rounded-full bg-muted p-4">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleButtonClick}
              disabled={disabled}
              className="mb-2"
            >
              <Upload className="mr-2 h-4 w-4" />
              Choose Image
            </Button>
            <p className="text-center text-xs text-muted-foreground">or drag and drop</p>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats
            .map((format) => {
              const mimeTypes: Record<string, string> = {
                JPG: 'image/jpeg',
                JPEG: 'image/jpeg',
                PNG: 'image/png',
                WEBP: 'image/webp',
                SVG: 'image/svg+xml',
              };
              return mimeTypes[format];
            })
            .join(',')}
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Upload Info */}
      <div className="space-y-1 rounded-md border border-blue-200 bg-blue-50 p-3">
        <p className="text-xs font-medium text-blue-900">Image Requirements:</p>
        <ul className="list-inside list-disc space-y-0.5 text-xs text-blue-700">
          <li>
            Recommended: {recommendedAspectRatio} ({recommendedDimensions})
          </li>
          <li>Max size: {maxSizeMB}MB</li>
          <li>Formats: {acceptedFormats.join(', ')}</li>
        </ul>
      </div>
    </div>
  );
}
