export const SITE = {
  name: "Dream Home Solutions",
  tagline: "Transforming Spaces, Creating Dreams",
  description:
    "Premium interior design, renovation, and home improvement services. From modular kitchens to complete home makeovers.",
  email: "info@dreamhomesolutions.com",
  phone: "+91 9611541469",
  address:
    "Sree Padha homes, RMG5+RMC, Maragondanahalli Rd, Shikaripalya, Electronic City, Bengaluru, Bommasandra, Karnataka 560105",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919611541469",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:4216",
};

export function getWhatsAppUrl(
  message = "Hi, I'd like to inquire about your services.",
): string {
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`;
}

export const STATS = [
  { label: "Projects Completed", value: "500+" },
  { label: "Happy Clients", value: "450+" },
  { label: "Years Experience", value: "15+" },
  { label: "Expert Team", value: "50+" },
];

export const WHY_CHOOSE_US = [
  {
    title: "Expert Craftsmanship",
    description: "Skilled professionals delivering precision work across every project phase.",
  },
  {
    title: "End-to-End Solutions",
    description: "From design consultation to final handover, we manage everything seamlessly.",
  },
  {
    title: "Quality Materials",
    description: "Premium materials sourced from trusted suppliers for lasting durability.",
  },
  {
    title: "On-Time Delivery",
    description: "Structured project timelines with transparent progress tracking.",
  },
];

export const DEFAULT_SERVICES = [
  "Interior Design",
  "Electrical Services",
  "Painting Services",
  "Modular Kitchen",
  "False Ceiling",
  "Home Renovation",
  "Commercial Interior Design",
  "Plumbing Services",
  "Custom Furniture",
  "Civil Works",
];

export const FAQS = [
  {
    question: "How long does a typical home renovation take?",
    answer:
      "Project timelines vary based on scope. A modular kitchen may take 3-4 weeks, while full home renovations typically range from 2-6 months.",
  },
  {
    question: "Do you provide free consultations?",
    answer:
      "Yes, we offer a complimentary initial consultation to understand your requirements and provide a preliminary estimate.",
  },
  {
    question: "What areas do you serve?",
    answer:
      "We serve Bengaluru and surrounding areas. Contact us to confirm availability in your location.",
  },
  {
    question: "Do you offer warranty on your work?",
    answer:
      "Yes, all our projects come with a comprehensive warranty covering workmanship and materials.",
  },
];
