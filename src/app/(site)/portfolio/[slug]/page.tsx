import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectDetail from "@/components/portfolio/ProjectDetail";
import { getPublicProjectBySlug } from "@/services/public.service";
import { SITE } from "@/constants/site";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPublicProjectBySlug(slug);
  if (!data) return { title: "Project Not Found" };

  const { project } = data;
  return {
    title: project.meta_title || `${project.title} | ${SITE.name}`,
    description: project.meta_description || project.short_description,
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const data = await getPublicProjectBySlug(slug);
  if (!data) notFound();

  return <ProjectDetail project={data.project} relatedProjects={data.relatedProjects} />;
}
