"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { cn, getMediaUrl } from "@/lib/utils";

import "swiper/css";

interface GallerySliderProps {
  images: string[];
  title: string;
  heading?: string;
  showHeading?: boolean;
  theme?: "light" | "dark";
  className?: string;
}

export default function GallerySlider({
  images,
  title,
  heading = "Gallery",
  showHeading = true,
  theme = "light",
  className,
}: GallerySliderProps) {
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const isDark = theme === "dark";
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const showPrev = useCallback(() => {
    setLightboxIndex((current) =>
      current === null ? null : (current - 1 + images.length) % images.length,
    );
  }, [images.length]);

  const showNext = useCallback(() => {
    setLightboxIndex((current) =>
      current === null ? null : (current + 1) % images.length,
    );
  }, [images.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") showPrev();
      if (event.key === "ArrowRight") showNext();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [lightboxIndex, closeLightbox, showPrev, showNext]);

  if (!images.length) return null;

  const showControls = images.length > 1;
  const slideLabel = `${activeIndex + 1} / ${images.length}`;

  const navButtonClass = cn(
    "flex h-10 w-10 shrink-0 items-center justify-center border-2 bg-transparent shadow-sm transition duration-300 sm:h-11 sm:w-11",
    isDark
      ? "border-background/40 text-background hover:border-primary hover:text-primary"
      : "border-foreground/30 text-foreground hover:border-primary hover:text-primary",
  );

  const counterClass = isDark ? "text-stone-300" : "text-stone-600";

  return (
    <>
      <div className={className ?? "min-w-0"}>
        {showHeading && (
          <h2 className="text-xl font-bold text-stone-900 sm:text-2xl">{heading}</h2>
        )}

        <div className={`relative min-w-0 overflow-hidden ${showHeading ? "mt-4 sm:mt-6" : ""}`}>
          <Swiper
            onSwiper={setSwiper}
            onSlideChange={(s) => setActiveIndex(s.realIndex)}
            spaceBetween={12}
            slidesPerView={1}
            breakpoints={{
              640: { spaceBetween: 16 },
              1024: { spaceBetween: 20, slidesPerView: 1.08 },
            }}
            loop={showControls}
            className="gallery-slider w-full"
          >
            {images.map((img, i) => (
              <SwiperSlide key={`${img}-${i}`} className="!h-auto">
                <button
                  type="button"
                  onClick={() => setLightboxIndex(i)}
                  className={cn(
                    "group relative block aspect-4/3 w-full cursor-zoom-in overflow-hidden bg-stone-100 shadow-md ring-1 sm:aspect-16/10",
                    isDark ? "ring-white/10" : "ring-stone-200/80",
                  )}
                  aria-label={`Open ${title} gallery image ${i + 1} in full view`}
                >
                  <Image
                    src={getMediaUrl(img)}
                    alt={`${title} gallery ${i + 1}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 66vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </button>
              </SwiperSlide>
            ))}
          </Swiper>

          {showControls && (
            <>
              <div className="pointer-events-none absolute inset-x-2 top-[calc(50%-1.25rem)] z-10 hidden -translate-y-1/2 justify-between sm:flex lg:inset-x-4">
                <button
                  type="button"
                  aria-label="Previous image"
                  onClick={() => swiper?.slidePrev()}
                  className={cn(navButtonClass, "pointer-events-auto backdrop-blur-sm", isDark && "bg-stone-950/40")}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  aria-label="Next image"
                  onClick={() => swiper?.slideNext()}
                  className={cn(navButtonClass, "pointer-events-auto backdrop-blur-sm", isDark && "bg-stone-950/40")}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 flex items-center justify-center gap-4 sm:hidden">
                <button type="button" aria-label="Previous image" onClick={() => swiper?.slidePrev()} className={navButtonClass}>
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className={cn("min-w-16 text-center text-sm font-medium tabular-nums", counterClass)}>
                  {slideLabel}
                </span>
                <button type="button" aria-label="Next image" onClick={() => swiper?.slideNext()} className={navButtonClass}>
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-5 flex items-center justify-center gap-2 overflow-x-auto pb-1 sm:mt-6 sm:gap-3">
                {images.map((img, index) => (
                  <button
                    key={`${img}-thumb-${index}`}
                    type="button"
                    aria-label={`Go to slide ${index + 1}`}
                    aria-current={activeIndex === index ? "true" : undefined}
                    onClick={() => swiper?.slideToLoop(index)}
                    className={cn(
                      "relative h-12 w-16 shrink-0 overflow-hidden border-2 transition duration-300 sm:h-14 sm:w-20",
                      activeIndex === index
                        ? "border-primary shadow-md shadow-primary/20 ring-2 ring-primary/30"
                        : isDark
                          ? "border-white/20 opacity-70 hover:border-white/50 hover:opacity-100"
                          : "border-stone-300 opacity-75 hover:border-primary/50 hover:opacity-100",
                    )}
                  >
                    <Image
                      src={getMediaUrl(img)}
                      alt={`${title} thumbnail ${index + 1}`}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>

              <p className={cn("mt-3 hidden text-center text-sm font-medium tabular-nums sm:block", counterClass)}>
                {slideLabel}
              </p>
            </>
          )}
        </div>
      </div>

      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/95 p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={`${title} gallery full view`}
          onClick={closeLightbox}
        >
          <button
            type="button"
            onClick={closeLightbox}
            aria-label="Close full view"
            className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center border-2 border-white/30 bg-transparent text-white transition hover:border-primary hover:text-primary sm:right-6 sm:top-6"
          >
            <X className="h-5 w-5" />
          </button>

          {showControls && (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  showPrev();
                }}
                aria-label="Previous image"
                className="absolute left-3 top-1/2 z-20 hidden -translate-y-1/2 border-2 border-white/30 bg-stone-950/40 p-3 text-white backdrop-blur transition hover:border-primary hover:text-primary sm:flex sm:left-6"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  showNext();
                }}
                aria-label="Next image"
                className="absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 border-2 border-white/30 bg-stone-950/40 p-3 text-white backdrop-blur transition hover:border-primary hover:text-primary sm:flex sm:right-6"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          <div
            className="relative flex h-full w-full max-w-6xl items-center justify-center"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative h-full max-h-[85vh] w-full">
              <Image
                src={getMediaUrl(images[lightboxIndex])}
                alt={`${title} gallery ${lightboxIndex + 1}`}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </div>
          </div>

          {showControls && (
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm font-medium tabular-nums text-white/80 sm:bottom-6">
              {lightboxIndex + 1} / {images.length}
            </p>
          )}
        </div>
      )}
    </>
  );
}
