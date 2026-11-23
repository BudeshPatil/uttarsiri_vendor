import type { Metadata } from "next";
import type { Project } from "@/types";
import SelectedWork from "@/components/portfolio/SelectedWork";
import { SITE } from "@/constants/site";

export const metadata: Metadata = {
  title: `Selected Work | ${SITE.name}`,
  description: "A preview page for the selected work portfolio component with sample content and imagery.",
};

const DEMO_PROJECTS: Project[] = [
  {
    project_id: "sw-01",
    title: "Aurora Residence",
    slug: "aurora-residence",
    category: "Residential Interior",
    location: "Bengaluru",
    budget: "INR 18L",
    project_status: "Completed",
    completion_date: "2026",
    short_description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    overview:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum vitae purus id neque ultrices fermentum.",
    cover_image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
  },
  {
    project_id: "sw-02",
    title: "Studio Frame",
    slug: "studio-frame",
    category: "Compact Living",
    location: "Pune",
    budget: "INR 12L",
    project_status: "Completed",
    completion_date: "2026",
    short_description:
      "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
    overview:
      "Morbi feugiat, elit a semper pretium, elit orci malesuada neque, sed bibendum arcu metus in eros.",
    cover_image:
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
  },
  {
    project_id: "sw-03",
    title: "The Courtyard House",
    slug: "the-courtyard-house",
    category: "Luxury Villa",
    location: "Bengaluru",
    budget: "INR 28L",
    project_status: "Completed",
    completion_date: "2026",
    short_description:
      "Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam.",
    overview:
      "Suspendisse potenti. Integer faucibus, velit sed pretium tincidunt, nibh orci luctus ex, sit amet finibus sem ligula eget nisi.",
    cover_image:
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    project_id: "sw-04",
    title: "Bayside Apartment",
    slug: "bayside-apartment",
    category: "Urban Renovation",
    location: "Goa",
    budget: "INR 16L",
    project_status: "In Progress",
    completion_date: "2026",
    short_description:
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    overview:
      "Praesent rhoncus, sem nec tincidunt posuere, magna dui pulvinar risus, a facilisis velit neque in nunc.",
    cover_image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
  },
  {
    project_id: "sw-05",
    title: "Gallery Lane",
    slug: "gallery-lane",
    category: "Show Apartment",
    location: "Hyderabad",
    budget: "INR 14L",
    project_status: "Completed",
    completion_date: "2026",
    short_description:
      "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    overview:
      "Donec ac elit sed risus posuere ultricies. Sed iaculis, nibh nec pellentesque posuere, justo quam gravida nisl.",
    cover_image:
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
  },
  {
    project_id: "sw-06",
    title: "Verve Kitchen",
    slug: "verve-kitchen",
    category: "Kitchen Design",
    location: "Chennai",
    budget: "INR 10L",
    project_status: "Completed",
    completion_date: "2026",
    short_description:
      "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni.",
    overview:
      "Nam pretium mi at mi volutpat, ac aliquet libero pharetra. Integer ullamcorper placerat augue, vitae fermentum sem.",
    cover_image:
      "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1200&q=80",
  },
  {
    project_id: "sw-07",
    title: "Loft Terrace",
    slug: "loft-terrace",
    category: "Penthouse",
    location: "Delhi",
    budget: "INR 22L",
    project_status: "Concept",
    completion_date: "2026",
    short_description:
      "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium.",
    overview:
      "Aliquam semper risus et orci suscipit, sed suscipit nibh porta. Cras vel nibh nec justo facilisis consectetur.",
    cover_image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
  },
  {
    project_id: "sw-08",
    title: "Nord House",
    slug: "nord-house",
    category: "Minimal Home",
    location: "Jaipur",
    budget: "INR 20L",
    project_status: "Completed",
    completion_date: "2026",
    short_description:
      "Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur.",
    overview:
      "Proin vehicula non lorem in interdum. Integer in dui sit amet urna ultrices egestas non sed massa.",
    cover_image:
      "https://images.unsplash.com/photo-1502005097973-6a7082348e28?auto=format&fit=crop&w=1200&q=80",
  },
  {
    project_id: "sw-09",
    title: "Canvas Office",
    slug: "canvas-office",
    category: "Workplace Interior",
    location: "Ahmedabad",
    budget: "INR 24L",
    project_status: "Completed",
    completion_date: "2026",
    short_description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.",
    overview:
      "Mauris iaculis ligula id felis viverra, a ultrices neque ultricies. Nulla facilisi.",
    cover_image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
  },
  {
    project_id: "sw-10",
    title: "Quiet Suite",
    slug: "quiet-suite",
    category: "Bedroom Suite",
    location: "Kochi",
    budget: "INR 11L",
    project_status: "Completed",
    completion_date: "2026",
    short_description:
      "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
    overview:
      "Fusce sit amet eros sed metus dictum molestie. Integer dignissim vestibulum massa, at consequat nibh.",
    cover_image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
  },
  {
    project_id: "sw-11",
    title: "Alto Lounge",
    slug: "alto-lounge",
    category: "Living Room",
    location: "Surat",
    budget: "INR 15L",
    project_status: "Completed",
    completion_date: "2026",
    short_description:
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    overview:
      "Curabitur sit amet mi sed ex euismod egestas. Cras eget ante sed magna efficitur fermentum.",
    cover_image:
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
  },
  {
    project_id: "sw-12",
    title: "Westend Studio",
    slug: "westend-studio",
    category: "Apartment Refresh",
    location: "Nagpur",
    budget: "INR 13L",
    project_status: "Planning",
    completion_date: "2026",
    short_description:
      "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    overview:
      "Pellentesque id nibh viverra, blandit mauris in, aliquet dui. Vivamus a est id orci maximus sollicitudin.",
    cover_image:
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
  },
  {
    project_id: "sw-13",
    title: "Amber Courtyard",
    slug: "amber-courtyard",
    category: "Courtyard Home",
    location: "Mysuru",
    budget: "INR 26L",
    project_status: "Completed",
    completion_date: "2026",
    short_description:
      "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni.",
    overview:
      "Integer ac nibh sed lorem elementum tincidunt. Donec sodales magna at justo iaculis, non mollis arcu viverra.",
    cover_image:
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    project_id: "sw-14",
    title: "Harbor House",
    slug: "harbor-house",
    category: "Seaside Home",
    location: "Alibaug",
    budget: "INR 30L",
    project_status: "Concept",
    completion_date: "2026",
    short_description:
      "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium.",
    overview:
      "Duis mollis, nisi et ullamcorper feugiat, tellus lacus consequat odio, id pulvinar risus urna nec leo.",
    cover_image:
      "https://images.unsplash.com/photo-1502005097973-6a7082348e28?auto=format&fit=crop&w=1200&q=80",
  },
  {
    project_id: "sw-15",
    title: "Oakline Dining",
    slug: "oakline-dining",
    category: "Dining Space",
    location: "Vadodara",
    budget: "INR 9L",
    project_status: "Completed",
    completion_date: "2026",
    short_description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.",
    overview:
      "Praesent mattis volutpat magna, nec accumsan metus sagittis et. Vestibulum ante ipsum primis in faucibus.",
    cover_image:
      "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1200&q=80",
  },
  {
    project_id: "sw-16",
    title: "Studio Bloom",
    slug: "studio-bloom",
    category: "Creative Space",
    location: "Indore",
    budget: "INR 17L",
    project_status: "Completed",
    completion_date: "2026",
    short_description:
      "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
    overview:
      "Suspendisse fermentum, lectus ut efficitur sollicitudin, justo nunc interdum nunc, in luctus lorem libero in lectus.",
    cover_image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
  },
  {
    project_id: "sw-17",
    title: "Cove Nook",
    slug: "cove-nook",
    category: "Reading Corner",
    location: "Bhopal",
    budget: "INR 8L",
    project_status: "Completed",
    completion_date: "2026",
    short_description:
      "Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam.",
    overview:
      "Vestibulum congue nulla vel nisl interdum, et vulputate turpis suscipit. Morbi feugiat nisi sed varius posuere.",
    cover_image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
  },
  {
    project_id: "sw-18",
    title: "Arcadia Bath",
    slug: "arcadia-bath",
    category: "Bath Suite",
    location: "Ranchi",
    budget: "INR 7L",
    project_status: "Completed",
    completion_date: "2026",
    short_description:
      "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    overview:
      "Integer ut erat lacinia, consequat mauris sed, ultrices odio. Donec faucibus placerat tincidunt.",
    cover_image:
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
  },
  {
    project_id: "sw-19",
    title: "Velvet Hall",
    slug: "velvet-hall",
    category: "Entertainment Room",
    location: "Rajkot",
    budget: "INR 19L",
    project_status: "In Progress",
    completion_date: "2026",
    short_description:
      "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni.",
    overview:
      "Nulla sit amet sapien sit amet velit dictum tristique. Quisque suscipit luctus leo, quis tempus lacus posuere in.",
    cover_image:
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    project_id: "sw-20",
    title: "Summit Hall",
    slug: "summit-hall",
    category: "Formal Living",
    location: "Nashik",
    budget: "INR 21L",
    project_status: "Completed",
    completion_date: "2026",
    short_description:
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    overview:
      "Vestibulum nec interdum augue. Cras at magna a risus auctor luctus quis at velit.",
    cover_image:
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
  },
];

export default function SelectedWorkPage() {
  return (
    <SelectedWork
      projects={DEMO_PROJECTS}
      eyebrow="Selected Work Preview"
      title="A portfolio slice with sample copy and Unsplash imagery"
      description="This page is meant for design checking only. It uses lorem ipsum content and repeatable project cards so you can judge spacing, density, contrast, and the image treatment."
      ctaHref="/portfolio"
      ctaLabel="Open Portfolio"
      variant="light"
      showFilters
      limit={20}
    />
  );
}
