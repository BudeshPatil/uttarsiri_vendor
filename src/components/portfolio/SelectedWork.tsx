"use client";

import type { Project } from "@/types";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import PortfolioGallery from "@/components/portfolio/PortfolioGallery";
import { cn } from "@/lib/utils";

type SelectedWorkVariant = "light" | "dark";

interface SelectedWorkProps {
  projects: Project[];
  eyebrow?: string;
  title?: string;
  description?: string;
  ctaHref?: string;
  ctaLabel?: string;
  variant?: SelectedWorkVariant;
  showFilters?: boolean;
  limit?: number;
  loading?: boolean;
  error?: string;
  className?: string;
}

const SECTION_STYLES = {
  light: "bg-stone-50 text-stone-900",
  dark: "bg-stone-950 text-white",
} as const;

const DARK_HEADING_OVERRIDE = "[&_h2]:text-white [&_p]:text-stone-400";

export default function SelectedWork({
  projects,
  eyebrow = "Selected Work",
  title = "A focused view of recent interior work",
  description =
    "Curated projects, consistent presentation, and a layout that stays readable when the content list gets longer.",
  ctaHref = "/portfolio",
  ctaLabel = "View All Projects",
  variant = "light",
  showFilters = true,
  limit = 20,
  loading = false,
  error,
  className,
}: SelectedWorkProps) {
  return (
    <section className={cn("py-20", SECTION_STYLES[variant], className)}>
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={eyebrow}
            title={title}
            description={description}
            className={variant === "dark" ? DARK_HEADING_OVERRIDE : undefined}
          />
        </Reveal>

        <PortfolioGallery
          projects={projects}
          variant={variant}
          showFilters={showFilters}
          limit={limit}
          loading={loading}
          error={error}
        />

        <div className="mt-10 text-center">
          <Button href={ctaHref}>{ctaLabel}</Button>
        </div>
      </Container>
    </section>
  );
}
