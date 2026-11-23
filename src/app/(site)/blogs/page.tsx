import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getPublicBlogs } from "@/services/public.service";
import { SITE } from "@/constants/site";
import type { Blog } from "@/types";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import BuildTogetherSection from "@/components/sections/BuildTogetherSection";
import { formatDate, getMediaUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: `Blog | ${SITE.name}`,
  description: "Interior design tips, home improvement guides, and industry insights from Dream Home Solutions.",
};

// Content below is managed from the admin panel. Without this the page is
// prerendered once at build time and served frozen (Cache-Control: s-maxage=1yr),
// so admin edits never appear until the next deploy.
export const revalidate = 60;

export default async function BlogsPage() {
  const blogs = await getPublicBlogs({ limit: "50" });

  return (
    <>
      <section className="bg-stone-950 py-20 text-white">
        <Container>
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-400">Blog</p>
          <h1 className="mt-4 text-4xl font-bold sm:text-5xl">Insights & Inspiration</h1>
          <p className="mt-6 max-w-2xl text-lg text-stone-300">
            Design trends, renovation tips, and expert advice for your home improvement journey.
          </p>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          {blogs.length === 0 ? (
            <p className="text-center text-stone-500">Blog posts coming soon!</p>
          ) : (
            <>
              <SectionHeading title="Latest Articles" />
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {blogs.map((blog: Blog) => (
                  <Link
                    key={blog.blog_id}
                    href={`/blogs/${blog.slug}`}
                    className="group overflow-hidden rounded-2xl border border-stone-200"
                  >
                    {blog.cover_image && (
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <Image
                          src={getMediaUrl(blog.cover_image)}
                          alt={blog.title}
                          fill
                          className="object-cover transition group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="p-5">
                      <p className="text-xs text-stone-500">
                        {blog.author && `${blog.author} • `}{formatDate(blog.created_at)}
                      </p>
                      <h2 className="mt-2 text-lg font-semibold text-stone-900 group-hover:text-amber-600">
                        {blog.title}
                      </h2>
                      <p className="mt-2 text-sm text-stone-600 line-clamp-3">{blog.excerpt}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </Container>
      </section>

      <BuildTogetherSection secondaryHref="/services" secondaryLabel="Explore Services" />
    </>
  );
}
