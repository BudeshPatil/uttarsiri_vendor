"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import { ABOUT_HERO_IMAGES } from "@/constants/about";
import { SITE } from "@/constants/site";
import Container from "@/components/ui/Container";
import { getPublicUrl } from "@/lib/utils";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

export default function AboutHero() {
  return (
    <section className="relative min-h-[78dvh] overflow-hidden bg-stone-950 text-white">
      <Swiper
        modules={[Autoplay, EffectFade, Pagination]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        autoplay={{ delay: 4500, disableOnInteraction: false, pauseOnMouseEnter: true }}
        pagination={{ clickable: true, dynamicBullets: true }}
        loop
        speed={900}
        className="about-hero-swiper absolute inset-0 h-full w-full [&_.swiper-pagination-bullet-active]:bg-primary [&_.swiper-pagination-bullet]:bg-white/50"
      >
        {ABOUT_HERO_IMAGES.map((image, index) => (
          <SwiperSlide key={image} className="relative h-full w-full">
            <Image
              src={getPublicUrl(image)}
              alt={`${SITE.name} about ${index + 1}`}
              fill
              priority={index === 0}
              sizes="100vw"
              className="about-hero-image object-cover"
            />
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="absolute inset-0 bg-linear-to-r from-stone-950/95 via-stone-950/75 to-stone-950/30" />

      <Container className="relative flex min-h-[78dvh] items-center py-24">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">About Us</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Building Dreams, One Space at a Time
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-stone-300">{SITE.description}</p>
          <div className="mt-8 flex flex-wrap gap-4 text-sm text-stone-400">
            <span className="border border-white/15 px-4 py-2">Est. 2010</span>
            <span className="border border-white/15 px-4 py-2">Bengaluru & Beyond</span>
            <span className="border border-white/15 px-4 py-2">Full-Service Interiors</span>
          </div>
        </div>
      </Container>
    </section>
  );
}
