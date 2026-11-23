import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import bannerService from '@/services/banner.service';
import { getMediaUrl } from '@/config/api';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Homepage banner slider preview.
 * Uses GET /api/banners/public — same endpoint the marketing site should call.
 */
export default function HomeBannerSlider({
  className,
  autoPlay = true,
  intervalMs = 5000,
  showControls = true,
}) {
  const [banners, setBanners] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await bannerService.getPublic();
      const items = response.data?.banners || response.data || [];
      setBanners(Array.isArray(items) ? items : []);
      setIndex(0);
    } catch (err) {
      setError(err.message || 'Failed to load banners');
      setBanners([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  useEffect(() => {
    if (!autoPlay || banners.length <= 1) return undefined;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % banners.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [autoPlay, banners.length, intervalMs]);

  const goTo = (next) => {
    if (!banners.length) return;
    setIndex((next + banners.length) % banners.length);
  };

  if (loading) {
    return (
      <div className={cn('rounded-2xl bg-slate-100 animate-pulse h-56 sm:h-72', className)} />
    );
  }

  if (error) {
    return (
      <div className={cn('rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-600', className)}>
        {error}
      </div>
    );
  }

  if (!banners.length) {
    return (
      <div className={cn('rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-500', className)}>
        No active banners. Add and activate banners to preview the homepage slider.
      </div>
    );
  }

  const current = banners[index];
  const imageSrc = getMediaUrl(current.image);
  const mobileSrc = getMediaUrl(current.mobile_image || current.image);

  return (
    <div className={cn('relative overflow-hidden rounded-2xl bg-black shadow-lg', className)}>
      <div className="relative h-56 sm:h-72 lg:h-80">
        <picture>
          {current.mobile_image && (
            <source media="(max-width: 640px)" srcSet={mobileSrc} />
          )}
          <img
            src={imageSrc}
            alt={current.title || 'Banner'}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent" />

        <div className="absolute inset-0 flex flex-col justify-end sm:justify-center p-5 sm:p-8 max-w-xl text-white">
          {current.subtitle && (
            <p className="text-xs sm:text-sm uppercase tracking-wide text-white/80 mb-1">
              {current.subtitle}
            </p>
          )}
          <h3 className="text-xl sm:text-3xl font-semibold leading-tight">{current.title}</h3>
          {current.description && (
            <p className="mt-2 text-sm sm:text-base text-white/85 line-clamp-2">
              {current.description}
            </p>
          )}
          {current.button_text && current.link_url && (
            <a
              href={current.link_url}
              target={current.link_target || '_self'}
              rel={current.link_target === '_blank' ? 'noopener noreferrer' : undefined}
              className="mt-4 inline-flex w-fit items-center rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100"
            >
              {current.button_text}
            </a>
          )}
        </div>
      </div>

      {showControls && banners.length > 1 && (
        <>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/90"
            onClick={() => goTo(index - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/90"
            onClick={() => goTo(index + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((banner, i) => (
              <button
                key={banner.banner_id || i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={cn(
                  'h-2.5 w-2.5 rounded-full transition-all',
                  i === index ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80',
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
