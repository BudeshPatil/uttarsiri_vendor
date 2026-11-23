"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import type { Banner } from "@/types";
import { cn, getMediaUrl } from "@/lib/utils";

import "swiper/css";
import "swiper/css/effect-fade";

const navButtonClass =
  "flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white shadow-lg backdrop-blur-md transition hover:border-amber-400 hover:bg-amber-500/90 sm:h-12 sm:w-12";

function getBannerImage(banner: Banner) {
  return banner.image || banner.mobile_image || "";
}

function HeroSlide({ banner }: { banner: Banner }) {
  const image = getBannerImage(banner);

  return (
    <div className="relative h-full w-full">
      {image && (
        <>
          <Image
            src={getMediaUrl(image)}
            alt={banner.title}
            fill
            priority
            sizes="100vw"
            className="hero-banner-image object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-stone-950/80 via-stone-950/20 to-stone-950/30" />
        </>
      )}
    </div>
  );
}

interface HeroBannerSliderProps {
  banners: Banner[];
}

export default function HeroBannerSlider({ banners }: HeroBannerSliderProps) {
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  if (!banners.length) {
    return <section className="relative h-[93dvh] overflow-hidden bg-stone-950" />;
  }

  const showControls = banners.length > 1;
  const slideLabel = `${String(activeIndex + 1).padStart(2, "0")} / ${String(banners.length).padStart(2, "0")}`;

  if (!showControls) {
    return (
      <section className="relative h-[93dvh] overflow-hidden bg-stone-950 text-white">
        <HeroSlide banner={banners[0]} />
      </section>
    );
  }

  return (
    <section className="relative h-[100dvh] min-h-[520px] overflow-hidden bg-stone-950 text-white">
      <Swiper
        modules={[Autoplay, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        onSwiper={setSwiper}
        onSlideChange={(s) => setActiveIndex(s.realIndex)}
        autoplay={{ delay: 5500, disableOnInteraction: false, pauseOnMouseEnter: true }}
        speed={900}
        loop
        className="hero-banner-swiper h-full w-full"
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.banner_id} className="relative h-full w-full">
            <HeroSlide banner={banner} />
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="pointer-events-none absolute inset-x-0 top-1/2 z-20 flex -translate-y-1/2 justify-between px-4 sm:px-8 lg:px-12">
        <button
          type="button"
          aria-label="Previous slide"
          onClick={() => swiper?.slidePrev()}
          className={`${navButtonClass} pointer-events-auto`}
        >
          <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
        <button
          type="button"
          aria-label="Next slide"
          onClick={() => swiper?.slideNext()}
          className={`${navButtonClass} pointer-events-auto`}
        >
          <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20 bg-linear-to-t from-stone-950/90 via-stone-950/50 to-transparent px-4 pb-5 pt-16 sm:px-8 sm:pb-7">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <p className="hidden text-sm font-medium tabular-nums tracking-[0.2em] text-white/70 sm:block">
            {slideLabel}
          </p>

          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1 sm:justify-end sm:gap-3">
            {banners.map((banner, index) => {
              const thumb = getBannerImage(banner);
              if (!thumb) return null;

              return (
                <button
                  key={banner.banner_id}
                  type="button"
                  aria-label={`Go to slide ${index + 1}: ${banner.title}`}
                  aria-current={activeIndex === index ? "true" : undefined}
                  onClick={() => swiper?.slideToLoop(index)}
                  className={cn(
                    "group relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition duration-300 sm:h-14 sm:w-20 sm:rounded-xl",
                    activeIndex === index
                      ? "border-amber-400 shadow-lg shadow-amber-500/30 ring-2 ring-amber-400/40"
                      : "border-white/20 opacity-75 hover:border-white/50 hover:opacity-100",
                  )}
                >
                  <Image
                    src={getMediaUrl(thumb)}
                    alt={banner.title}
                    fill
                    sizes="80px"
                    className={cn(
                      "object-cover transition duration-300",
                      activeIndex === index ? "scale-100" : "scale-110 group-hover:scale-100",
                    )}
                  />
                  <span
                    className={cn(
                      "absolute inset-0 transition",
                      activeIndex === index ? "bg-amber-500/10" : "bg-stone-950/30 group-hover:bg-stone-950/10",
                    )}
                  />
                </button>
              );
            })}
          </div>

          <p className="text-center text-xs font-medium tabular-nums tracking-[0.18em] text-white/70 sm:hidden">
            {slideLabel}
          </p>
        </div>
      </div>
    </section>
  );
}
