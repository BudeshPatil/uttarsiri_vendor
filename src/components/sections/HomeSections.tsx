"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ChefHat,
  Hammer,
  PaintBucket,
  PanelTop,
  Sofa,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import HeroBannerSlider from "@/components/sections/HeroBannerSlider";
import TestimonialSlider from "@/components/sections/TestimonialSlider";
import type { Banner, Blog, Project, Service, SiteStat, Testimonial, Faq } from "@/types";
import { FAQS, DEFAULT_SERVICES, SITE, STATS, WHY_CHOOSE_US } from "@/constants/site";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import Reveal, { fadeUpItem, staggerContainer } from "@/components/ui/Reveal";
import InquiryForm from "@/components/forms/InquiryForm";
import { getMediaUrl, getPublicUrl } from "@/lib/utils";
import PortfolioGallery from "@/components/portfolio/PortfolioGallery";

const IMG_ZOOM =
  "object-cover transition-transform duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-110";

interface ServiceVisual {
  primary: string;
  hover?: string;
  icon: LucideIcon;
}

const SERVICE_VISUALS: Record<string, ServiceVisual> = {
  "interior-design": {
    primary: getPublicUrl("/images/services/interior/minh-pham-OtXADkUh3-I-unsplash.jpg"),
    hover: getPublicUrl("/images/services/interior/jason-wang-5MG8cQbw-T8-unsplash.jpg"),
    icon: Sofa,
  },
  "electrical-services": {
    primary: getPublicUrl("/images/services/electric/colsan-ltda-LMb98OOtoYU-unsplash.jpg"),
    icon: Zap,
  },
  "painting-services": {
    primary: getPublicUrl("/images/services/painting/ernys-57ldq9age5U-unsplash.jpg"),
    hover: getPublicUrl("/images/services/painting/ricky-singh-BdsRtr03Wko-unsplash.jpg"),
    icon: PaintBucket,
  },
  "modular-kitchen": {
    primary: getPublicUrl("/images/services/modular-kitchen/sven-brandsma-3hEGHI4b4gg-unsplash.jpg"),
    hover: getPublicUrl("/images/services/modular-kitchen/naomi-hebert-MP0bgaS_d1c-unsplash.jpg"),
    icon: ChefHat,
  },
  "false-ceiling": {
    primary: getPublicUrl("/images/services/false-ceiling/sam-moghadam-Z9UkirW1sVs-unsplash.jpg"),
    hover: getPublicUrl("/images/services/false-ceiling/claudio-mezzasalma-1qZ94JesPi4-unsplash.jpg"),
    icon: PanelTop,
  },
  "home-renovation": {
    primary: getPublicUrl("/images/services/renovation/karl-solano-eQ-8iUrb07g-unsplash.jpg"),
    hover: getPublicUrl("/images/services/renovation/immo-renovation-UqNEbyRQ660-unsplash.jpg"),
    icon: Hammer,
  },
};

const SERVICE_VISUAL_FALLBACK_ORDER = Object.keys(SERVICE_VISUALS);

const SERVICE_KEYWORD_MAP: [RegExp, keyof typeof SERVICE_VISUALS][] = [
  [/electric/i, "electrical-services"],
  [/paint/i, "painting-services"],
  [/kitchen/i, "modular-kitchen"],
  [/ceiling/i, "false-ceiling"],
  [/renovat/i, "home-renovation"],
  [/interior/i, "interior-design"],
];

function getServiceVisual(service: { slug: string; title: string; category?: string }, index: number): ServiceVisual {
  if (SERVICE_VISUALS[service.slug]) return SERVICE_VISUALS[service.slug];

  const haystack = `${service.title} ${service.category || ""}`;
  const match = SERVICE_KEYWORD_MAP.find(([pattern]) => pattern.test(haystack));
  if (match) return SERVICE_VISUALS[match[1]];

  const fallbackKey = SERVICE_VISUAL_FALLBACK_ORDER[index % SERVICE_VISUAL_FALLBACK_ORDER.length];
  return SERVICE_VISUALS[fallbackKey];
}

function getServiceImages(
  service: Service & { banner_image?: string; gallery?: string[] },
  index: number,
): ServiceVisual {
  const visual = getServiceVisual(service, index);

  return {
    primary: service.banner_image ? getMediaUrl(service.banner_image) : visual.primary,
    hover: service.gallery?.[0] ? getMediaUrl(service.gallery[0]) : visual.hover,
    icon: visual.icon,
  };
}

interface HomeSectionsProps {
  banners: Banner[];
  services: Service[];
  projects: Project[];
  testimonials: Testimonial[];
  blogs: Blog[];
}

export function HeroSection({ banners }: { banners: Banner[] }) {
  return <HeroBannerSlider banners={banners} />;
}

export function IntroSection({ stats }: { stats?: SiteStat[] }) {
  // Managed under admin -> Settings -> Site Stats; the bundled constant is the
  // fallback so the section is never empty if the API is unreachable.
  // const items = stats?.length ? stats : STATS;
  const items = stats?.length ? stats : [];

  return (
    <section className="py-20">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal y={20}>
            <SectionHeading
              align="left"
              eyebrow="About Us"
              title="Creating Beautiful Spaces Since 2010"
              description="Dream Home Solutions is your trusted partner for complete interior design and home improvement services. We combine creative design with expert execution."
            />
            <p className="text-stone-600 leading-relaxed">
              From concept to completion, our team handles every detail — design planning,
              material selection, project management, and quality assurance — so you can
              enjoy a stress-free transformation of your space.
            </p>
            <Button href="/about" className="mt-8">
              Learn More About Us
            </Button>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="group relative aspect-4/5 overflow-hidden rounded-3xl">
              <Image
                src={getPublicUrl("/images/about.jpg")}
                alt="Bright, elegantly styled living room by Dream Home Solutions"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className={IMG_ZOOM}
              />
            </div>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              className="relative z-10 -mt-16 ml-6 grid max-w-xs grid-cols-2 gap-3 sm:ml-10"
            >
              {items.map((stat) => (
                <motion.div
                  key={stat.label}
                  variants={fadeUpItem}
                  className="rounded-2xl border border-stone-200 bg-white p-5 text-center shadow-lg shadow-stone-900/5"
                >
                  <p className="text-2xl font-bold text-amber-600">{stat.value}</p>
                  <p className="mt-1 text-xs text-stone-600">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

export function ServicesSection({ services }: { services: Service[] }) {
  const slugify = (text: string) => text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const displayServices = services.length > 0
    ? services.slice(0, 6)
    : DEFAULT_SERVICES.slice(0, 6).map((title) => ({
        service_id: slugify(title),
        title,
        slug: slugify(title),
        short_description: `Professional ${title.toLowerCase()} for residential and commercial spaces.`,
      }));

  return (
    <section className="bg-stone-50 py-20">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Our Services"
            title="Complete Home Improvement Solutions"
            description="Professional services tailored to transform every corner of your home or commercial space."
          />
        </Reveal>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {displayServices.map((service, index) => {
            const visual = getServiceImages(service, index);
            const Icon = visual.icon;
            return (
              <motion.div key={service.service_id} variants={fadeUpItem}>
                <Link
                  href={`/services/${service.slug}`}
                  className="group block overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-stone-900/10"
                >
                  <div className="relative aspect-4/3 overflow-hidden bg-stone-100">
                    <Image
                      src={visual.primary}
                      alt={service.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className={`${IMG_ZOOM} ${visual.hover ? "group-hover:opacity-0" : ""}`}
                    />
                    {visual.hover && (
                      <Image
                        src={visual.hover}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                      />
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-stone-950/70 via-stone-950/0 to-transparent" />
                    <span className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-amber-600 shadow-md backdrop-blur transition-transform duration-300 group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white">
                      <Icon className="h-5 w-5" />
                    </span>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-stone-900 transition-colors group-hover:text-amber-600">
                      {service.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-stone-600">
                      {service.short_description}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-amber-600">
                      Learn more <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
        <div className="mt-10 text-center">
          <Button href="/services" variant="primary">
            View All Services
          </Button>
        </div>
      </Container>
    </section>
  );
}

export function WhyChooseUsSection() {
  return (
    <section className="py-20">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Why Choose Us"
            title="The Dream Home Difference"
            description="We deliver exceptional results through expertise, transparency, and dedication to your vision."
          />
        </Reveal>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <div className="group relative aspect-4/5 overflow-hidden rounded-3xl">
              <Image
                src={getPublicUrl("/images/whychoose.jpg")}
                alt="Elegantly furnished living room showcasing quality craftsmanship"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className={IMG_ZOOM}
              />
            </div>
          </Reveal>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="grid gap-6 sm:grid-cols-2"
          >
            {WHY_CHOOSE_US.map((item) => (
              <motion.div key={item.title} variants={fadeUpItem} className="rounded-2xl border border-stone-200 p-6">
                <div className="mb-4 h-1 w-12 rounded-full bg-amber-600" />
                <h3 className="font-semibold text-stone-900">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-stone-600">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Container>
    </section>
  );
}

export function PortfolioSection({ projects }: { projects: Project[] }) {
  if (projects.length === 0) return null;

  return (
    <section className="bg-stone-950 py-20 text-white">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Portfolio"
            title="Featured Projects"
            description="Explore our recent transformations and see the quality of our craftsmanship."
            className="[&_h2]:text-white [&_p]:text-stone-400"
          />
        </Reveal>
        <PortfolioGallery projects={projects.slice(0, 6)} variant="dark" limit={6} />
        <div className="mt-10 text-center">
          <Button href="/portfolio" variant="secondary">View Full Portfolio</Button>
        </div>
      </Container>
    </section>
  );
}

export function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null;

  return (
    <section className="py-20">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Testimonials"
            title="What Our Clients Say"
            description="Real feedback from homeowners and businesses who trusted us with their spaces."
          />
        </Reveal>
        <Reveal delay={0.1} className="mt-12">
          <TestimonialSlider testimonials={testimonials} />
        </Reveal>
      </Container>
    </section>
  );
}

export function FAQSection({ faqs }: { faqs?: Faq[] }) {
  // Managed under admin -> FAQs; the bundled constant is the fallback so the
  // section is never empty if the API is unreachable.
  // const items = faqs?.length ? faqs : FAQS;
  const items = faqs?.length ? faqs : [];

  return (
    <section className="bg-stone-50 py-20">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="FAQs"
            title="Frequently Asked Questions"
            description="Find answers to common questions about our services and process."
          />
        </Reveal>
        <Reveal delay={0.1} className="mx-auto max-w-3xl divide-y divide-stone-200 rounded-2xl border border-stone-200 bg-white">
          {items.map((faq) => (
            <details key={faq.question} className="group p-6">
              <summary className="cursor-pointer list-none font-semibold text-stone-900 marker:hidden">
                {faq.question}
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-stone-600">{faq.answer}</p>
            </details>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}

export function ContactCTASection() {
  return (
    <section className="py-20">
      <Container>
        <Reveal>
          <div className="relative grid gap-12 overflow-hidden rounded-3xl p-8 text-white lg:grid-cols-2 lg:p-12">
            <Image
              src="/images/interior/aranprime-KbytCpI1i5I-unsplash.jpg"
              alt="Warmly lit modern lounge at dusk"
              fill
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-br from-stone-950/98 via-stone-950/45 to-stone-950/65" />

            <div className="relative">
              <SectionHeading
                align="left"
                eyebrow="Get In Touch"
                title="Ready to Transform Your Space?"
                description="Share your requirements and our team will get back to you within 24 hours with a personalized consultation."
                className="[&_h2]:text-white [&_p]:text-stone-400"
              />
              <div className="space-y-3 text-sm text-stone-300">
                <p>Phone: {SITE.phone}</p>
                <p>Email: {SITE.email}</p>
                <p>Address: {SITE.address}</p>
              </div>
            </div>
            <div className="relative rounded-2xl bg-white/15 backdrop-blur-lg border border-white/30 shadow-xl p-6 text-white">
              <InquiryForm buttonVariant="secondary" />
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
