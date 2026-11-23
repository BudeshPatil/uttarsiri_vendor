import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getPublicBlogBySlug } from "@/services/public.service";
import { SITE } from "@/constants/site";
import Container from "@/components/ui/Container";
import BuildTogetherSection from "@/components/sections/BuildTogetherSection";
import { formatDate, getMediaUrl } from "@/lib/utils";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getPublicBlogBySlug(slug);
  if (!blog) return { title: "Blog Not Found" };

  return {
    title: `${blog.title} | ${SITE.name}`,
    description: blog.excerpt,
    openGraph: {
      title: blog.title,
      description: blog.excerpt,
      type: "article",
      images: blog.cover_image ? [getMediaUrl(blog.cover_image)] : [],
    },
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const blog = await getPublicBlogBySlug(slug);
  if (!blog) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    description: blog.excerpt,
    author: { "@type": "Person", name: blog.author || SITE.name },
    datePublished: blog.created_at,
    image: blog.cover_image ? getMediaUrl(blog.cover_image) : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article>
        <section className="bg-stone-950 py-20 text-white">
          <Container>
            <p className="text-sm text-stone-400">
              {blog.author && `${blog.author} • `}{formatDate(blog.created_at)}
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold">{blog.title}</h1>
            {blog.excerpt && (
              <p className="mt-6 max-w-2xl text-lg text-stone-300">{blog.excerpt}</p>
            )}
          </Container>
        </section>

        {blog.cover_image && (
          <Container className="-mt-10">
            <div className="relative aspect-[21/9] overflow-hidden rounded-2xl shadow-xl">
              <Image
                src={getMediaUrl(blog.cover_image)}
                alt={blog.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </Container>
        )}

        <Container className="py-16">
          <div
            className="prose prose-stone mx-auto max-w-3xl prose-headings:font-bold prose-a:text-amber-600"
            dangerouslySetInnerHTML={{ __html: blog.content || "" }}
          />
        </Container>
      </article>

      <BuildTogetherSection secondaryHref="/blogs" secondaryLabel="Read More Articles" />
    </>
  );
}
