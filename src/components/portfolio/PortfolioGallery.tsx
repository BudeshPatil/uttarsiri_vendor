"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight, Filter, Sparkles } from "lucide-react";
import type { Project, ProjectCategory } from "@/types";
import Button from "@/components/ui/Button";
import { fadeUpItem, staggerContainer } from "@/components/ui/Reveal";
import { cn, getMediaUrl } from "@/lib/utils";

type GalleryVariant = "light" | "dark";

interface PortfolioGalleryProps {
  projects: Project[];
  /** Managed categories from the admin. Falls back to whatever the projects carry. */
  categories?: ProjectCategory[];
  variant?: GalleryVariant;
  showFilters?: boolean;
  limit?: number;
  loading?: boolean;
  error?: string;
  className?: string;
}

const VARIANT_STYLES = {
  light: {
    text: "text-stone-900",
    muted: "text-stone-600",
    faint: "text-stone-500",
    panel: "border-stone-200 bg-white",
    card: "border-stone-200 bg-white shadow-sm",
    chip: "border-stone-200 bg-white text-stone-700 hover:border-amber-300 hover:text-amber-700",
    chipActive: "border-amber-600 bg-amber-600 text-white",
    chipLabel: "text-amber-600",
    focus: "focus-visible:ring-offset-stone-50",
    empty: "border-stone-200 bg-white",
  },
  dark: {
    text: "text-white",
    muted: "text-stone-400",
    faint: "text-stone-500",
    panel: "border-stone-800 bg-stone-900",
    card: "border-stone-800 bg-stone-900 shadow-none",
    chip: "border-stone-700 bg-stone-900 text-stone-300 hover:border-amber-400 hover:text-white",
    chipActive: "border-amber-500 bg-amber-600 text-white",
    chipLabel: "text-amber-400",
    focus: "focus-visible:ring-offset-stone-950",
    empty: "border-stone-800 bg-stone-900",
  },
} as const;

function getProjectCategory(project: Project) {
  return project.category?.trim() || "Uncategorized";
}

function getProjectDescription(project: Project) {
  return (
    project.short_description ||
    project.overview ||
    "Interior design work planned and delivered with careful attention to finish quality."
  );
}

function getProjectMeta(project: Project) {
  return [project.location, project.budget, project.project_status].filter(Boolean).join(" • ");
}

/**
 * Chips come from the managed category list where one exists, so the admin
 * controls both wording and order. Categories with nothing to show are dropped,
 * and any category a project carries but the admin has not registered is still
 * appended — otherwise those projects become unreachable through the filter.
 */
function buildCategoryList(projects: Project[], managed?: ProjectCategory[]) {
  const counts = new Map<string, number>();
  const labels = new Map<string, string>();

  for (const project of projects) {
    const category = getProjectCategory(project);
    const key = category.toLowerCase();
    counts.set(key, (counts.get(key) ?? 0) + 1);
    if (!labels.has(key)) labels.set(key, category);
  }

  if (!managed?.length) {
    return [...labels.values()].map((name) => ({ name, count: counts.get(name.toLowerCase()) ?? 0 }));
  }

  const ordered: { name: string; count: number }[] = [];
  const used = new Set<string>();

  for (const category of managed) {
    const name = category.name?.trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (!counts.has(key)) continue;
    ordered.push({ name, count: counts.get(key) ?? 0 });
    used.add(key);
  }

  for (const [key, name] of labels) {
    if (!used.has(key)) ordered.push({ name, count: counts.get(key) ?? 0 });
  }

  return ordered;
}

function PortfolioCard({ project, variant }: { project: Project; variant: GalleryVariant }) {
  const styles = VARIANT_STYLES[variant];
  const meta = getProjectMeta(project);

  return (
    <motion.article variants={fadeUpItem} className="h-full">
      <Link
        href={`/portfolio/${project.slug}`}
        className={cn(
          "group flex h-full flex-col overflow-hidden rounded-2xl border transition duration-300",
          "hover:-translate-y-1.5 hover:shadow-xl hover:shadow-stone-900/10",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500",
          styles.focus,
          styles.card,
        )}
        aria-label={`View project: ${project.title}`}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
          {project.cover_image ? (
            <Image
              src={getMediaUrl(project.cover_image)}
              alt={project.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-105 group-focus-visible:scale-105"
            />
          ) : (
            <div
              className={cn(
                "flex h-full w-full items-center justify-center",
                variant === "dark" ? "bg-stone-800 text-stone-400" : "bg-stone-100 text-stone-500",
              )}
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                Preview unavailable
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-stone-950/55 via-stone-950/0 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-900 shadow-sm backdrop-blur">
            {getProjectCategory(project)}
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <p
            className={cn(
              "text-[11px] font-semibold uppercase tracking-[0.18em]",
              styles.chipLabel,
            )}
          >
            {meta || "Portfolio project"}
          </p>
          <h3
            className={cn(
              "mt-2 line-clamp-2 text-lg font-semibold tracking-tight",
              styles.text,
            )}
          >
            {project.title}
          </h3>
          <p className={cn("mt-2 line-clamp-2 text-sm leading-relaxed", styles.muted)}>
            {getProjectDescription(project)}
          </p>

          {project.completion_date && (
            <p className={cn("mt-4 text-xs font-medium uppercase tracking-[0.16em]", styles.faint)}>
              Completed {project.completion_date}
            </p>
          )}

          <span
            className={cn(
              "mt-5 inline-flex items-center gap-2 text-sm font-semibold",
              variant === "dark" ? "text-amber-400" : "text-amber-600",
            )}
          >
            View project
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-focus-visible:translate-x-1" />
          </span>
        </div>
      </Link>
    </motion.article>
  );
}

function SkeletonCard({ variant }: { variant: GalleryVariant }) {
  const styles = VARIANT_STYLES[variant];

  return (
    <div className={cn("overflow-hidden rounded-2xl border", styles.card)}>
      <div className={cn("aspect-[4/3] animate-pulse", variant === "dark" ? "bg-stone-800" : "bg-stone-100")} />
      <div className="space-y-3 p-5 sm:p-6">
        <div className={cn("h-3 w-24 animate-pulse rounded-full", variant === "dark" ? "bg-stone-700" : "bg-stone-200")} />
        <div className={cn("h-5 w-4/5 animate-pulse rounded-full", variant === "dark" ? "bg-stone-700" : "bg-stone-200")} />
        <div className={cn("h-4 w-full animate-pulse rounded-full", variant === "dark" ? "bg-stone-700" : "bg-stone-200")} />
        <div className={cn("h-4 w-3/4 animate-pulse rounded-full", variant === "dark" ? "bg-stone-700" : "bg-stone-200")} />
      </div>
    </div>
  );
}

export default function PortfolioGallery({
  projects,
  categories: managedCategories,
  variant = "light",
  showFilters = false,
  limit,
  loading = false,
  error,
  className,
}: PortfolioGalleryProps) {
  const styles = VARIANT_STYLES[variant];
  const categories = buildCategoryList(projects, managedCategories);
  const [activeCategory, setActiveCategory] = useState("All");
  // The results grid reveals itself on scroll, which is right on first paint but
  // wrong after filtering: the new cards often mount below the fold, so they stay
  // at opacity 0 and the section looks empty even though the counter shows a
  // match. Once the filter has been touched, animate immediately instead.
  const [hasFiltered, setHasFiltered] = useState(false);

  const selectCategory = (category: string) => {
    setHasFiltered(true);
    setActiveCategory(category);
  };

  const revealProps = hasFiltered
    ? ({ animate: "show" } as const)
    : ({ whileInView: "show", viewport: { once: true, amount: 0.15 } } as const);

  const filteredProjects =
    activeCategory === "All"
      ? projects
      : projects.filter(
          (project) => getProjectCategory(project).toLowerCase() === activeCategory.toLowerCase(),
        );

  const visibleProjects = typeof limit === "number" ? filteredProjects.slice(0, limit) : filteredProjects;
  const isBusy = loading;

  if (error) {
    return (
      <div className={cn("rounded-3xl border p-6 sm:p-8", styles.empty, className)}>
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className={cn("text-lg font-semibold", styles.text)}>Portfolio unavailable</h3>
            <p className={cn("mt-2 text-sm leading-relaxed", styles.muted)}>
              {error}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button href="/contact" size="sm">
                Contact Us
              </Button>
              <Button href="/services" variant="outline" size="sm">
                Explore Services
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isBusy && projects.length === 0) {
    return (
      <div className={cn("rounded-3xl border p-6 sm:p-8", styles.empty, className)}>
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className={cn("text-lg font-semibold", styles.text)}>No projects available yet</h3>
            <p className={cn("mt-2 text-sm leading-relaxed", styles.muted)}>
              We are preparing new portfolio entries. Check back soon or speak with us about your project.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button href="/contact" size="sm">
                Start a Project
              </Button>
              <Button href="/about" variant="outline" size="sm">
                Learn About Us
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const showFilterBar = showFilters && categories.length > 0;

  return (
    <div className={cn("space-y-6", className)} aria-busy={isBusy}>
      {showFilterBar && (
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-semibold text-stone-900">Filter by category</span>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {[{ name: "All", count: projects.length }, ...categories].map((category) => {
              const active = category.name === activeCategory;
              const disabled = isBusy;

              return (
                <button
                  key={category.name}
                  type="button"
                  onClick={() => selectCategory(category.name)}
                  disabled={disabled}
                  aria-pressed={active}
                  className={cn(
                    "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500",
                    styles.focus,
                    active ? styles.chipActive : styles.chip,
                    disabled && "cursor-not-allowed opacity-60",
                  )}
                >
                  {category.name}
                  <span className={cn("ml-2 text-xs tabular-nums", active ? "opacity-80" : "opacity-60")}>
                    {category.count}
                  </span>
                </button>
              );
            })}
          </div>

          <p className={cn("mt-4 text-sm", styles.muted)} aria-live="polite">
            Showing {visibleProjects.length} of {filteredProjects.length} projects
          </p>
        </div>
      )}

      {isBusy ? (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
        >
          {Array.from({ length: limit ?? 6 }).map((_, index) => (
            <motion.div key={index} variants={fadeUpItem}>
              <SkeletonCard variant={variant} />
            </motion.div>
          ))}
        </motion.div>
      ) : visibleProjects.length > 0 ? (
        <motion.div
          key={activeCategory}
          variants={staggerContainer}
          initial="hidden"
          {...revealProps}
          className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
        >
          {visibleProjects.map((project) => (
            <PortfolioCard key={project.project_id} project={project} variant={variant} />
          ))}
        </motion.div>
      ) : (
        <div className={cn("rounded-3xl border p-6 sm:p-8", styles.empty)}>
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className={cn("text-lg font-semibold", styles.text)}>No matching projects</h3>
              <p className={cn("mt-2 text-sm leading-relaxed", styles.muted)}>
                Try a different category or clear the filter to view the full portfolio.
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="mt-5"
                onClick={() => selectCategory("All")}
              >
                Clear Filter
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
