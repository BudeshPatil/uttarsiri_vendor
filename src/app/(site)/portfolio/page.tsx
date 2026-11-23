import type { Metadata } from "next";
import { getPublicProjects, getPublicProjectCategories } from "@/services/public.service";
import { SITE } from "@/constants/site";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import PortfolioGallery from "@/components/portfolio/PortfolioGallery";
import BuildTogetherSection from "@/components/sections/BuildTogetherSection";

export const metadata: Metadata = {
  title: `Portfolio | ${SITE.name}`,
  description: "Browse our portfolio of completed interior design and renovation projects.",
};

// Categories and projects are both admin-managed, so this page must not stay
// frozen at build time.
export const revalidate = 60;

export default async function PortfolioPage() {
  const [projects, categories] = await Promise.all([
    getPublicProjects({ limit: "50" }),
    getPublicProjectCategories(),
  ]);

  return (
    <>
      <section className="bg-stone-950 py-20 text-white">
        <Container>
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-400">Portfolio</p>
          <h1 className="mt-4 text-4xl font-bold sm:text-5xl">Our Projects</h1>
          <p className="mt-6 max-w-2xl text-lg text-stone-300">
            Explore our completed projects showcasing design excellence and quality craftsmanship.
          </p>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <Reveal>
            <SectionHeading
              title="Featured Work"
              description="A selection of our recent transformations."
              align="left"
              className="max-w-4xl"
            />
          </Reveal>
          <PortfolioGallery projects={projects} categories={categories} showFilters variant="light" />
        </Container>
      </section>

      <BuildTogetherSection />
    </>
  );
}
