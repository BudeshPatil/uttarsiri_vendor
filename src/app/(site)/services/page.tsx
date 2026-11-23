import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getPublicServices } from "@/services/public.service";
import { DEFAULT_SERVICES, SITE } from "@/constants/site";
import type { Service } from "@/types";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import BuildTogetherSection from "@/components/sections/BuildTogetherSection";
import { getMediaUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: `Our Services | ${SITE.name}`,
  description: "Explore our complete range of interior design, renovation, and home improvement services.",
};

function slugify(text: string) {
  return text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

// Content below is managed from the admin panel. Without this the page is
// prerendered once at build time and served frozen (Cache-Control: s-maxage=1yr),
// so admin edits never appear until the next deploy.
export const revalidate = 60;

export default async function ServicesPage() {
  const services = await getPublicServices({ limit: "50" });

  const displayItems = services.length > 0
    ? services
    : DEFAULT_SERVICES.map((title) => ({
        service_id: slugify(title),
        title,
        slug: slugify(title),
        short_description: `Professional ${title.toLowerCase()} services for residential and commercial spaces.`,
      }));

  return (
    <>
      <section className="bg-stone-950 py-20 text-white">
        <Container>
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-400">Services</p>
          <h1 className="mt-4 text-4xl font-bold sm:text-5xl">Our Services</h1>
          <p className="mt-6 max-w-2xl text-lg text-stone-300">
            Comprehensive home improvement solutions delivered by experienced professionals.
          </p>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <SectionHeading
            title="What We Offer"
            description="From design to execution, we handle every aspect of your project."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {displayItems.map((service: Service) => (
              <Link
                key={service.service_id}
                href={`/services/${service.slug}`}
                className="group block overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                {service.banner_image && (
                  <div className="relative aspect-4/3 overflow-hidden bg-stone-100">
                    <Image
                      src={getMediaUrl(service.banner_image)}
                      alt={service.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-stone-950/50 via-transparent to-transparent" />
                  </div>
                )}
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-stone-900 group-hover:text-amber-600">
                    {service.title}
                  </h2>
                  <p className="mt-3 text-sm text-stone-600">
                    {service.short_description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-amber-600">
                    View details <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <BuildTogetherSection secondaryHref="/portfolio" secondaryLabel="View Our Work" />
    </>
  );
}
