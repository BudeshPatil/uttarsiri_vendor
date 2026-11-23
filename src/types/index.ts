export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface Service {
  service_id: string;
  title: string;
  slug: string;
  short_description?: string;
  description?: string;
  overview?: string;
  category?: string;
  banner_image?: string;
  icon?: string;
  features?: string[];
  benefits?: string[];
  process_steps?: { title: string; description: string; icon?: string }[];
  gallery?: string[];
  faqs?: { question: string; answer: string }[];
  related_services?: string[];
  meta_title?: string;
  meta_description?: string;
  status?: string;
  is_featured?: boolean;
}

export interface GalleryImage {
  gallery_id: string;
  title: string;
  image: string;
  alt_text?: string;
  caption?: string;
  section?: string;
  sort_order?: number;
  status?: string;
  is_featured?: boolean;
}

export interface ProjectCategory {
  category_id: string;
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  sort_order?: number;
  status?: string;
  project_count?: number;
}

export interface SiteStat {
  value: string;
  label: string;
}

export interface Faq {
  faq_id: string;
  question: string;
  answer: string;
  sort_order?: number;
  status?: string;
  is_featured?: boolean;
}

export interface Project {
  project_id: string;
  title: string;
  slug: string;
  short_description?: string;
  description?: string;
  overview?: string;
  category?: string;
  location?: string;
  budget?: string;
  project_status?: string;
  completion_date?: string;
  cover_image?: string;
  before_image?: string;
  after_image?: string;
  gallery?: string[] | string;
  meta_title?: string;
  meta_description?: string;
  is_featured?: boolean;
}

export interface ProjectDetailResponse {
  project: Project;
  relatedProjects: Project[];
}

export interface Blog {
  blog_id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  author?: string;
  cover_image?: string;
  status?: string;
  created_at?: string;
}

export interface Testimonial {
  testimonial_id: string;
  customer_name: string;
  customer_image?: string;
  customer_location?: string;
  service_name?: string;
  rating: number;
  content: string;
  is_featured?: boolean;
}

export interface Banner {
  banner_id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  mobile_image?: string;
  link_url?: string;
  button_text?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  service_interest?: string;
  source?: string;
}
