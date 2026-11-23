"use client";

import GallerySlider from "@/components/ui/GallerySlider";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";

interface AboutGallerySectionProps {
  images: string[];
}

export default function AboutGallerySection({ images }: AboutGallerySectionProps) {
  return (
    <section className="bg-stone-950 py-20 text-white">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Gallery"
            title="Craft, Detail & Finished Spaces"
            description="A glimpse into the interiors, finishes, and transformations we deliver every day."
            className="[&>p:first-child]:text-primary [&_h2]:text-white [&_p]:text-stone-400"
          />
        </Reveal>
        <Reveal delay={0.1}>
          <GallerySlider
            images={images}
            title="Dream Home Solutions"
            showHeading={false}
            theme="dark"
            className="mt-10 min-w-0"
          />
        </Reveal>
      </Container>
    </section>
  );
}
