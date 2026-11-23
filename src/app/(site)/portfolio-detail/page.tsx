import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import ProjectDetail from "@/components/portfolio/ProjectDetail";
import { getPublicProjectBySlug, getPublicProjects } from "@/services/public.service";
import { SITE } from "@/constants/site";

interface Props {
  searchParams: Promise<{ slug?: string }>;
}

export const metadata: Metadata = {
  title: `Portfolio Detail | ${SITE.name}`,
  description: "View a completed interior design and renovation project from our portfolio.",
};

export default async function PortfolioDetailPreviewPage({ searchParams }: Props) {
  const { slug } = await searchParams;

  if (slug) {
    redirect(`/portfolio/${slug}`);
  }

  const projects = await getPublicProjects({ limit: "1" });
  const firstProject = projects[0];

  if (!firstProject) notFound();

  const data = await getPublicProjectBySlug(firstProject.slug);
  if (!data) notFound();

  return <ProjectDetail project={data.project} relatedProjects={data.relatedProjects} />;
}
