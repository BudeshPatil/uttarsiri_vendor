import type { Metadata } from "next";
import Image from "next/image";
import { Award, Clock, Shield, Users } from "lucide-react";
import { ABOUT_IMAGES, ABOUT_STORY_IMAGES, ABOUT_VALUES } from "@/constants/about";
import { SITE, STATS, WHY_CHOOSE_US } from "@/constants/site";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import BuildTogetherSection from "@/components/sections/BuildTogetherSection";
import AboutHero from "@/components/about/AboutHero";
import AboutGallerySection from "@/components/about/AboutGallerySection";
import { getPublicUrl } from "@/lib/utils";
import { getPublicGallery, getSiteStats } from "@/services/public.service";

export const metadata: Metadata = {
  title: `About Us | ${SITE.name}`,
  description: `Learn about ${SITE.name} — our story, vision, mission, and the team behind your dream home transformations.`,
};

// The gallery is managed from the admin, so the page must not stay frozen at
// build time. Next re-renders it at most once every 5 minutes.
export const revalidate = 60;

const VALUE_ICONS = [Award, Shield, Users, Clock];

export default async function AboutPage() {
  // Managed from the admin Gallery module; falls back to the bundled images
  // so the section never renders empty if the API is unreachable.
  const [gallery, stats] = await Promise.all([
    getPublicGallery({ section: "about" }),
    getSiteStats(),
  ]);
  const statItems = stats.length > 0 ? stats : STATS;
  // const galleryImages = gallery.length > 0
  //   ? gallery.map((item) => item.image)
  //   : [...ABOUT_IMAGES];

  const galleryImages = gallery.length > 0
    ? gallery.map((item) => item.image)
    : [];

  return (
    <>
      <AboutHero />

      <section className="py-20">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <Reveal>
              <SectionHeading align="left" eyebrow="Our Story" title="From Vision to Reality" />
              <div className="space-y-4 text-justify text-stone-600 leading-relaxed">
                <p>
                  Founded in 2010, Dream Home Solutions began with a simple mission: to make premium
                  interior design accessible to every homeowner. What started as a small team of
                  passionate designers has grown into a full-service home improvement company.
                </p>
                <p>
                  Today, we serve hundreds of clients across Bengaluru and beyond, delivering projects
                  that exceed expectations in quality, design, and timely completion.
                </p>
                <p>
                  Every space we touch reflects our belief that great design should feel personal,
                  functional, and built to last.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.12} className="grid grid-cols-2 gap-4">
              <div className="relative col-span-2 aspect-16/10 overflow-hidden bg-stone-100">
                <Image
                  src={getPublicUrl(ABOUT_STORY_IMAGES[0])}
                  alt="Dream Home Solutions interior project"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              {ABOUT_STORY_IMAGES.slice(1).map((image, index) => (
                <div key={image} className="relative aspect-square overflow-hidden bg-stone-100">
                  <Image
                    src={getPublicUrl(image)}
                    alt={`Dream Home Solutions workspace ${index + 2}`}
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition duration-500 hover:scale-105"
                  />
                </div>
              ))}
            </Reveal>
          </div>
        </Container>
      </section>

      <section className="border-y border-stone-200 bg-stone-950 py-14 text-white">
        <Container>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {statItems.map((stat, index) => (
              <Reveal key={stat.label} delay={index * 0.08} className="text-center">
                <p className="text-4xl font-bold text-primary">{stat.value}</p>
                <p className="mt-2 text-sm uppercase tracking-[0.16em] text-stone-400">{stat.label}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-stone-50 py-20">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Purpose"
              title="What Drives Us Forward"
              description="Our vision and mission guide every design decision and every project we deliver."
            />
          </Reveal>
          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            {ABOUT_VALUES.map((item, index) => (
              <Reveal key={item.title} delay={index * 0.1}>
                <article className="group overflow-hidden border border-stone-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <div className="relative aspect-16/10 overflow-hidden bg-stone-100">
                    <Image
                      src={getPublicUrl(item.image)}
                      alt={item.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-stone-950/50 to-transparent" />
                    <h2 className="absolute bottom-5 left-5 text-2xl font-bold text-white">{item.title}</h2>
                  </div>
                  <p className="p-6 text-stone-600 leading-relaxed">{item.description}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <AboutGallerySection images={galleryImages} />

      <section className="py-20">
        <Container>
          <Reveal>
            <SectionHeading eyebrow="Why Us" title="What Sets Us Apart" />
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_CHOOSE_US.map((item, index) => {
              const Icon = VALUE_ICONS[index] ?? Award;
              return (
                <Reveal key={item.title} delay={index * 0.08}>
                  <div className="h-full border border-stone-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-stone-900">{item.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-stone-600">{item.description}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      <BuildTogetherSection />
    </>
  );
}
