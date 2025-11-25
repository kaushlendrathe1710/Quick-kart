import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  label: string;
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  onFileSelect?: (file: File) => void;
  maxSizeInMB?: number;
  aspectRatio?: string;
  disabled?: boolean;
  required?: boolean;
}

export function ImageUpload({
  label,
  value,
  onChange,
  onFileSelect,
  maxSizeInMB = 5,
  aspectRatio = '16/9',
  disabled = false,
  required = false,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size
    if (file.size > maxSizeInMB * 1024 * 1024) {
      alert(`File size must be less than ${maxSizeInMB}MB`);
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Call parent handler if provided
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <Label>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || uploading}
      />

      {preview ? (
        <Card className="relative overflow-hidden">
          <div className="relative bg-muted" style={{ aspectRatio }}>
            <img src={preview} alt="Preview" className="h-full w-full object-contain" />
            {!disabled && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute right-2 top-2"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <Card
          className={cn(
            'cursor-pointer border-2 border-dashed transition-colors hover:border-primary/50',
            disabled && 'cursor-not-allowed opacity-50'
          )}
          onClick={disabled ? undefined : handleClick}
        >
          <div className="flex flex-col items-center justify-center py-8" style={{ aspectRatio }}>
            {uploading ? (
              <>
                <Loader2 className="mb-2 h-10 w-10 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </>
            ) : (
              <>
                <ImageIcon className="mb-2 h-10 w-10 text-muted-foreground" />
                <p className="mb-1 text-sm text-muted-foreground">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to {maxSizeInMB}MB</p>
              </>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

interface MultiImageUploadProps {
  label: string;
  values: string[];
  onChange: (urls: string[]) => void;
  onFilesSelect?: (files: File[]) => void;
  maxImages?: number;
  maxSizeInMB?: number;
  disabled?: boolean;
}

export function MultiImageUpload({
  label,
  values,
  onChange,
  onFilesSelect,
  maxImages = 10,
  maxSizeInMB = 5,
  disabled = false,
}: MultiImageUploadProps) {
  const [previews, setPreviews] = useState<string[]>(values);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Check total count
    if (previews.length + files.length > maxImages) {
      alert(`You can upload a maximum of ${maxImages} images`);
      return;
    }

    // Validate all files
    const validFiles: File[] = [];
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file`);
        continue;
      }
      if (file.size > maxSizeInMB * 1024 * 1024) {
        alert(`${file.name} is larger than ${maxSizeInMB}MB`);
        continue;
      }
      validFiles.push(file);
    }

    // Generate previews
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    // Call parent handler
    if (onFilesSelect) {
      onFilesSelect(validFiles);
    }
  };

  const handleRemove = (index: number) => {
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
    onChange(newPreviews);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <Label>
        {label} ({previews.length}/{maxImages})
      </Label>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFilesChange}
        className="hidden"
        disabled={disabled || previews.length >= maxImages}
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {previews.map((preview, index) => (
          <Card key={index} className="relative overflow-hidden">
            <div className="relative aspect-square bg-muted">
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="h-full w-full object-cover"
              />
              {!disabled && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute right-1 top-1 h-6 w-6"
                  onClick={() => handleRemove(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </Card>
        ))}

        {previews.length < maxImages && (
          <Card
            className={cn(
              'cursor-pointer border-2 border-dashed transition-colors hover:border-primary/50',
              disabled && 'cursor-not-allowed opacity-50'
            )}
            onClick={disabled ? undefined : handleClick}
          >
            <div className="flex aspect-square flex-col items-center justify-center">
              <Upload className="mb-1 h-6 w-6 text-muted-foreground" />
              <p className="px-2 text-center text-xs text-muted-foreground">Add Image</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
