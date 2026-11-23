import api from "@/lib/api";
import type {
  ApiResponse,
  Banner,
  Blog,
  ContactFormData,
  Faq,
  GalleryImage,
  Project,
  ProjectCategory,
  ProjectDetailResponse,
  Service,
  SiteStat,
  Testimonial,
} from "@/types";

export async function getPublicBanners(): Promise<Banner[]> {
  try {
    const res = (await api.get("/banners/public")) as ApiResponse<{ banners?: Banner[] } | Banner[]>;
    const data = res.data;
    return Array.isArray(data) ? data : data?.banners || [];
  } catch {
    return [];
  }
}

export async function getPublicServices(params?: Record<string, string>): Promise<Service[]> {
  try {
    const res = (await api.get("/services/public", { params })) as ApiResponse<{ services: Service[] }>;
    return res.data?.services || [];
  } catch {
    return [];
  }
}

export async function getPublicServiceBySlug(slug: string): Promise<Service | null> {
  try {
    const res = (await api.get(`/services/public/${slug}`)) as ApiResponse<Service>;
    return res.data || null;
  } catch {
    return null;
  }
}

export async function getPublicProjects(params?: Record<string, string>): Promise<Project[]> {
  try {
    const res = (await api.get("/projects/public", { params })) as ApiResponse<{ projects: Project[] }>;
    return res.data?.projects || [];
  } catch {
    return [];
  }
}

export async function getPublicProjectCategories(): Promise<ProjectCategory[]> {
  try {
    const res = (await api.get("/project-categories/public")) as ApiResponse<{ categories: ProjectCategory[] }>;
    return res.data?.categories || [];
  } catch {
    return [];
  }
}

export async function getPublicProjectBySlug(slug: string): Promise<ProjectDetailResponse | null> {
  try {
    const res = (await api.get(`/projects/public/${slug}`)) as ApiResponse<{
      project: Project;
      related_projects?: Project[];
    }>;
    if (!res.data?.project) return null;

    return {
      project: res.data.project,
      relatedProjects: res.data.related_projects || [],
    };
  } catch {
    return null;
  }
}

export async function getPublicBlogs(params?: Record<string, string>): Promise<Blog[]> {
  try {
    const res = (await api.get("/blogs/public", { params })) as ApiResponse<{ blogs: Blog[] }>;
    return res.data?.blogs || [];
  } catch {
    return [];
  }
}

export async function getPublicBlogBySlug(slug: string): Promise<Blog | null> {
  try {
    const res = (await api.get(`/blogs/public/${slug}`)) as ApiResponse<Blog>;
    return res.data || null;
  } catch {
    return null;
  }
}

export async function getPublicFaqs(): Promise<Faq[]> {
  try {
    const res = (await api.get("/faqs/public")) as ApiResponse<{ faqs: Faq[] }>;
    return res.data?.faqs || [];
  } catch {
    return [];
  }
}

export async function getPublicGallery(params?: Record<string, string>): Promise<GalleryImage[]> {
  try {
    const res = (await api.get("/galleries/public", { params })) as ApiResponse<{ galleries: GalleryImage[] }>;
    return res.data?.galleries || [];
  } catch {
    return [];
  }
}

export async function getPublicTestimonials(): Promise<Testimonial[]> {
  try {
    const res = (await api.get("/testimonials/public")) as ApiResponse<{ testimonials: Testimonial[] }>;
    return res.data?.testimonials || [];
  } catch {
    return [];
  }
}

export async function submitContactForm(data: ContactFormData) {
  return api.post("/contacts", {
    ...data,
    source: data.source || "website",
  });
}

export async function getSiteStats(): Promise<SiteStat[]> {
  try {
    const res = (await api.get("/settings/public")) as ApiResponse<{ SITE_STATS?: SiteStat[] }>;
    return res.data?.SITE_STATS?.filter((stat) => stat?.value || stat?.label) || [];
  } catch {
    return [];
  }
}

export async function getBranding() {
  try {
    const res = (await api.get("/settings/branding")) as ApiResponse<{ logo?: string; favicon?: string }>;
    return res.data || {};
  } catch {
    return {};
  }
}
