"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import type { Testimonial } from "@/types";
import { cn } from "@/lib/utils";

import "swiper/css";

const navButtonClass =
  "flex h-10 w-10 shrink-0 items-center justify-center border-2 border-foreground/30 bg-transparent text-foreground shadow-sm transition duration-300 hover:border-primary hover:text-primary sm:h-11 sm:w-11";

function TestimonialCard({ item }: { item: Testimonial }) {
  return (
    <figure className="flex h-full flex-col rounded-2xl border border-stone-200 bg-white p-6">
      <div className="mb-4 flex gap-1">
        {Array.from({ length: item.rating }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-amber-500 text-amber-500" />
        ))}
      </div>
      <blockquote className="grow text-sm leading-relaxed text-stone-600">
        &ldquo;{item.content}&rdquo;
      </blockquote>
      <figcaption className="mt-6 border-t border-stone-100 pt-4">
        <p className="font-semibold text-stone-900">{item.customer_name}</p>
        {item.customer_location && (
          <p className="text-xs text-stone-500">{item.customer_location}</p>
        )}
      </figcaption>
    </figure>
  );
}

export default function TestimonialSlider({ testimonials }: { testimonials: Testimonial[] }) {
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  if (!testimonials.length) return null;

  // 3 cards are visible at the largest breakpoint, so there is only something to
  // scroll past that.
  const MAX_SLIDES_PER_VIEW = 3;
  const showControls = testimonials.length > MAX_SLIDES_PER_VIEW;

  // True loop mode needs twice the visible slides or Swiper warns and silently
  // disables itself. Below that, `rewind` gives the same cycling behaviour —
  // autoplay and the arrows wrap from the last slide back to the first — it just
  // animates back instead of sliding on seamlessly.
  const canLoop = testimonials.length >= MAX_SLIDES_PER_VIEW * 2;
  const canRewind = showControls && !canLoop;
  const slideLabel = `${activeIndex + 1} / ${testimonials.length}`;

  // The dots are desktop-only, where 3 cards show at once. Without loop mode the
  // last reachable position is length - 3, so rendering one dot per testimonial
  // would leave the trailing ones dead. Loop mode makes every index reachable.
  const dotCount = canLoop
    ? testimonials.length
    : Math.max(1, testimonials.length - MAX_SLIDES_PER_VIEW + 1);

  return (
    <div className="relative min-w-0">
      <Swiper
        modules={[Autoplay]}
        onSwiper={setSwiper}
        onSlideChange={(s) => setActiveIndex(s.realIndex)}
        spaceBetween={16}
        slidesPerView={1}
        breakpoints={{
          640: { slidesPerView: 2, spaceBetween: 20 },
          1024: { slidesPerView: 3, spaceBetween: 24 },
        }}
        loop={canLoop}
        rewind={canRewind}
        autoplay={showControls ? { delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true } : false}
        speed={600}
        className="w-full"
      >
        {testimonials.map((item) => (
          // !h-auto lets the flex card stretch so every slide matches the tallest.
          <SwiperSlide key={item.testimonial_id} className="!h-auto">
            <TestimonialCard item={item} />
          </SwiperSlide>
        ))}
      </Swiper>

      {showControls && (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 hidden -translate-y-1/2 justify-between lg:flex lg:-mx-6 xl:-mx-8">
            <button
              type="button"
              aria-label="Previous testimonial"
              onClick={() => swiper?.slidePrev()}
              className={cn(navButtonClass, "pointer-events-auto bg-white/80 backdrop-blur-sm")}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Next testimonial"
              onClick={() => swiper?.slideNext()}
              className={cn(navButtonClass, "pointer-events-auto bg-white/80 backdrop-blur-sm")}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-6 flex items-center justify-center gap-4 lg:hidden">
            <button
              type="button"
              aria-label="Previous testimonial"
              onClick={() => swiper?.slidePrev()}
              className={navButtonClass}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="min-w-16 text-center text-sm font-medium tabular-nums text-stone-600">
              {slideLabel}
            </span>
            <button
              type="button"
              aria-label="Next testimonial"
              onClick={() => swiper?.slideNext()}
              className={navButtonClass}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-6 hidden items-center justify-center gap-2 lg:flex">
            {Array.from({ length: dotCount }, (_, index) => (
              <button
                key={`testimonial-dot-${index}`}
                type="button"
                aria-label={`Go to testimonial ${index + 1}`}
                aria-current={activeIndex === index ? "true" : undefined}
                onClick={() => (canLoop ? swiper?.slideToLoop(index) : swiper?.slideTo(index))}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  activeIndex === index
                    ? "w-6 bg-primary"
                    : "w-2 bg-stone-300 hover:bg-stone-400",
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
