import type { Metadata } from "next";
import {
  getPublicBanners,
  getPublicProjects,
  getPublicServices,
  getPublicTestimonials,
  getPublicFaqs,
  getSiteStats,
} from "@/services/public.service";
import {
  ContactCTASection,
  FAQSection,
  HeroSection,
  IntroSection,
  PortfolioSection,
  ServicesSection,
  TestimonialsSection,
  WhyChooseUsSection,
} from "@/components/sections/HomeSections";
import { SITE } from "@/constants/site";

export const metadata: Metadata = {
  title: `${SITE.name} | ${SITE.tagline}`,
  description: SITE.description,
  openGraph: {
    title: SITE.name,
    description: SITE.description,
    url: SITE.url,
    siteName: SITE.name,
    type: "website",
  },
};

// Content below is managed from the admin panel. Without this the page is
// prerendered once at build time and served frozen (Cache-Control: s-maxage=1yr),
// so admin edits never appear until the next deploy.
export const revalidate = 60;

export default async function HomePage() {
  const [banners, services, projects, testimonials, stats, faqs] = await Promise.all([
    getPublicBanners(),
    getPublicServices({ featured: "true", limit: "6" }),
    getPublicProjects({ featured: "true", limit: "6" }),
    getPublicTestimonials(),
    getSiteStats(),
    getPublicFaqs(),
  ]);

  return (
    <>
      <HeroSection banners={banners} />
      <IntroSection stats={stats} />
      <ServicesSection services={services} />
      <WhyChooseUsSection />
      <PortfolioSection projects={projects} />
      <TestimonialsSection testimonials={testimonials} />
      <FAQSection faqs={faqs} />
      <ContactCTASection />
    </>
  );
}
