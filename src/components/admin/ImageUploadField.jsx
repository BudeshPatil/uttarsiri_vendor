import { ImagePlus, X } from 'lucide-react';
import { getMediaUrl } from '@/config/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import FormField from '@/components/admin/FormField';

/**
 * URL field with optional file upload.
 * The Upload button is shown only when an `onUpload` handler is supplied
 * (vendors paste hosted URLs because the upload API is admin-only).
 */
export default function ImageUploadField({
  label,
  hint,
  value,
  onChange,
  uploading,
  onUpload,
  placeholder = '/public/uploads/image.jpg',
  showPreview = true,
  previewClassName = 'h-32 w-full rounded-lg border border-gray-200 object-cover',
}) {
  return (
    <FormField label={label} hint={hint}>
      <div className="space-y-2">
        {value && showPreview ? (
          <div className="relative">
            <img
              src={getMediaUrl(value)}
              alt={label}
              className={previewClassName}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8"
              onClick={() => onChange('')}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : null}
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
          {onUpload ? (
            <Button type="button" variant="outline" disabled={uploading} asChild className="shrink-0">
              <label className="cursor-pointer">
                <ImagePlus className="w-4 h-4 mr-2" />
                {uploading ? 'Uploading...' : 'Upload'}
                <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
              </label>
            </Button>
          ) : null}
        </div>
      </div>
    </FormField>
  );
}
