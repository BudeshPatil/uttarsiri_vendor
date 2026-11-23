"use client";

import Image from "next/image";
import { CalendarCheck, MapPin, Sparkles, Wallet } from "lucide-react";
import type { Project } from "@/types";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import GallerySlider from "@/components/ui/GallerySlider";
import InquiryForm from "@/components/forms/InquiryForm";
import PortfolioGallery from "@/components/portfolio/PortfolioGallery";
import BuildTogetherSection from "@/components/sections/BuildTogetherSection";
import { cn, getMediaUrl, normalizeGallery, splitParagraphs } from "@/lib/utils";

interface ProjectDetailProps {
  project: Project;
  relatedProjects?: Project[];
  className?: string;
}

function getCategory(project: Project) {
  return project.category?.trim() || "Uncategorized";
}

function ImageTile({
  src,
  alt,
  label,
}: {
  src: string;
  alt: string;
  label?: string;
}) {
  return (
    <div className="group relative aspect-4/3 overflow-hidden rounded-2xl border border-stone-200 bg-stone-100">
      <Image
        src={getMediaUrl(src)}
        alt={alt}
        fill
        sizes="(max-width: 1024px) 100vw, 50vw"
        className="object-cover transition duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-105"
      />
      {label && (
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-900 shadow-sm backdrop-blur">
          {label}
        </span>
      )}
    </div>
  );
}

function SubsectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-widest text-amber-600">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">{title}</h2>
    </div>
  );
}

export default function ProjectDetail({ project, relatedProjects = [], className }: ProjectDetailProps) {
  const gallery = normalizeGallery(project.gallery);
  const overviewParagraphs = splitParagraphs(project.overview);

  const quickFacts = [
    { label: "Location", value: project.location, icon: MapPin },
    { label: "Budget", value: project.budget, icon: Wallet },
    { label: "Completed", value: project.completion_date, icon: CalendarCheck },
  ].filter((fact) => Boolean(fact.value));

  return (
    <div className={className}>
      <section className="relative overflow-hidden bg-stone-950 py-24 text-white">
        {project.cover_image && (
          <>
            <Image
              src={getMediaUrl(project.cover_image)}
              alt={project.title}
              fill
              priority
              className="object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-linear-to-t from-stone-950 via-stone-950/70 to-stone-950/40" />
          </>
        )}
        <Container className="relative">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-widest text-amber-400">
              {getCategory(project)}
              {project.location && ` • ${project.location}`}
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">{project.title}</h1>
            {project.short_description && (
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-stone-300">
                {project.short_description}
              </p>
            )}
            {project.project_status && (
              <span className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                {project.project_status}
              </span>
            )}
          </Reveal>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <div className="grid gap-12 lg:grid-cols-3">
            <div className="min-w-0 space-y-14 lg:col-span-2">
              {overviewParagraphs.length > 0 && (
                <Reveal>
                  <SubsectionHeading eyebrow="Project Overview" title="What we set out to do" />
                  <div className="mt-4 space-y-4">
                    {overviewParagraphs.map((paragraph, index) => (
                      <p key={index} className="text-justify text-stone-600 leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </Reveal>
              )}

              {(project.before_image || project.after_image) && (
                <Reveal>
                  <SubsectionHeading eyebrow="Transformation" title="Before & After" />
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {project.before_image && (
                      <ImageTile src={project.before_image} alt={`${project.title} before`} label="Before" />
                    )}
                    {project.after_image && (
                      <ImageTile src={project.after_image} alt={`${project.title} after`} label="After" />
                    )}
                  </div>
                </Reveal>
              )}

              {gallery.length > 0 && (
                <Reveal>
                  <SubsectionHeading eyebrow="Gallery" title="A closer look" />
                  <GallerySlider
                    images={gallery}
                    title={project.title}
                    showHeading={false}
                    className="mt-6 min-w-0"
                  />
                </Reveal>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {quickFacts.length > 0 && (
                  <Reveal>
                    <dl className={cn("grid gap-3", quickFacts.length > 1 && "sm:grid-cols-1")}>
                      {quickFacts.map((fact) => (
                        <div
                          key={fact.label}
                          className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                            <fact.icon className="h-4.5 w-4.5" />
                          </div>
                          <div className="min-w-0">
                            <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-600">
                              {fact.label}
                            </dt>
                            <dd className="mt-0.5 truncate text-sm font-semibold text-stone-900">
                              {fact.value}
                            </dd>
                          </div>
                        </div>
                      ))}
                    </dl>
                  </Reveal>
                )}

                <Reveal delay={0.1}>
                  <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
                    <InquiryForm serviceInterest="Similar Project" />
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {relatedProjects.length > 0 && (
        <section className="bg-stone-50 py-20">
          <Container>
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-widest text-amber-600">More Work</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
                Related Projects
              </h2>
            </Reveal>
            <div className="mt-10">
              <PortfolioGallery projects={relatedProjects} variant="light" limit={3} />
            </div>
            <div className="mt-10 text-center">
              <Button href="/portfolio">Browse Full Portfolio</Button>
            </div>
          </Container>
        </section>
      )}

      <BuildTogetherSection />
    </div>
  );
}
