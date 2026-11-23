import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getPublicServiceBySlug, getPublicServices } from "@/services/public.service";
import { SITE } from "@/constants/site";
import Container from "@/components/ui/Container";
import InquiryForm from "@/components/forms/InquiryForm";
import ServiceGallerySlider from "@/components/services/ServiceGallerySlider";
import BuildTogetherSection from "@/components/sections/BuildTogetherSection";
import { getMediaUrl } from "@/lib/utils";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = await getPublicServiceBySlug(slug);
  if (!service) return { title: "Service Not Found" };

  return {
    title: service.meta_title || `${service.title} | ${SITE.name}`,
    description: service.meta_description || service.short_description,
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = await getPublicServiceBySlug(slug);
  if (!service) notFound();

  return (
    <>
      <section className="relative bg-stone-950 py-24 text-white">
        {service.banner_image && (
          <Image
            src={getMediaUrl(service.banner_image)}
            alt={service.title}
            fill
            className="object-cover opacity-30"
          />
        )}
        <Container className="relative">
          <p className="text-sm uppercase tracking-widest text-amber-400">{service.category}</p>
          <h1 className="mt-4 text-4xl font-bold sm:text-5xl">{service.title}</h1>
          <p className="mt-6 max-w-2xl text-lg text-stone-300">{service.short_description}</p>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <div className="grid gap-12 lg:grid-cols-3">
            <div className="min-w-0 lg:col-span-2 space-y-12">
              {service.overview && (
                <div>
                  <h2 className="text-2xl font-bold text-stone-900">Overview</h2>
                  <div className="mt-4 space-y-4">
                    {service.overview
                      .split(/\n+/)
                      .map((paragraph) => paragraph.trim())
                      .filter(Boolean)
                      .map((paragraph, index) => (
                        <p key={index} className="text-justify text-stone-600 leading-relaxed">
                          {paragraph}
                        </p>
                      ))}
                  </div>
                </div>
              )}

              {service.features && service.features.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-stone-900">Features</h2>
                  <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                    {service.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-stone-600">
                        <span className="h-2 w-2 rounded-full bg-amber-500" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {service.gallery && service.gallery.length > 0 && (
                <ServiceGallerySlider images={service.gallery} title={service.title} />
              )}

              {service.benefits && service.benefits.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-stone-900">Benefits</h2>
                  <ul className="mt-4 space-y-3">
                    {service.benefits.map((b) => (
                      <li key={b} className="rounded-xl bg-stone-50 px-4 py-3 text-stone-600">{b}</li>
                    ))}
                  </ul>
                </div>
              )}

              {service.process_steps && service.process_steps.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-stone-900">Our Process</h2>
                  <div className="mt-6 space-y-4">
                    {service.process_steps.map((step, i) => (
                      <div key={i} className="flex gap-4 rounded-xl border border-stone-200 p-4">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-700">
                          {i + 1}
                        </span>
                        <div>
                          <h3 className="font-semibold text-stone-900">{step.title}</h3>
                          <p className="mt-1 text-sm text-stone-600">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {service.faqs && service.faqs.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-stone-900">FAQs</h2>
                  <div className="mt-4 divide-y divide-stone-200 rounded-xl border border-stone-200">
                    {service.faqs.map((faq) => (
                      <details key={faq.question} className="p-4">
                        <summary className="cursor-pointer font-medium text-stone-900">{faq.question}</summary>
                        <p className="mt-2 text-sm text-stone-600">{faq.answer}</p>
                      </details>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-stone-200 p-6 h-fit sticky top-24">
              <InquiryForm serviceInterest={service.title} />
            </div>
          </div>
        </Container>
      </section>

      <BuildTogetherSection secondaryHref="/services" secondaryLabel="View All Services" />
    </>
  );
}
