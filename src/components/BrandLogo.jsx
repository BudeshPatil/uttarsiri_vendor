import { useEffect, useState } from 'react';
import { useBranding } from '@/contexts/BrandingContext';
import { cn } from '@/lib/utils';

/**
 * Shared site logo used on auth pages, sidebar, and loading states.
 */
export default function BrandLogo({
  variant = 'logo',
  alt = 'Site Logo',
  className,
  ...props
}) {
  const { logoUrl, faviconUrl } = useBranding();
  const src = variant === 'favicon' ? faviconUrl : logoUrl;
  const [imageSrc, setImageSrc] = useState(src);

  useEffect(() => {
    setImageSrc(src);
  }, [src]);

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={cn('h-full w-full object-contain object-center', className)}
      onError={() => {
        if (imageSrc !== faviconUrl) setImageSrc(faviconUrl);
      }}
      {...props}
    />
  );
}
