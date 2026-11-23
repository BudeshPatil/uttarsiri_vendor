import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getPublicUrl(path?: string | null): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (!baseUrl) return normalizedPath;

  return `${baseUrl.replace(/\/$/, "")}${normalizedPath}`;
}

function getBackendOrigin(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5016/api";
  return apiUrl.replace(/\/api\/?$/, "");
}

export function getMediaUrl(path?: string | null): string {
  if (!path) return "";

  if (path.startsWith("http")) {
    const origin = getBackendOrigin();
    if (path.startsWith(origin)) {
      const pathname = path.slice(origin.length);
      return `/backend${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
    }
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (normalizedPath.startsWith("/public/")) {
    return `/backend${normalizedPath}`;
  }

  return normalizedPath;
}

export function normalizeGallery(gallery?: string[] | string | null): string[] {
  if (!gallery) return [];
  if (Array.isArray(gallery)) return gallery.filter(Boolean);
  if (typeof gallery === "string" && gallery.trim()) return [gallery.trim()];
  return [];
}

export function splitParagraphs(text?: string | null): string[] {
  if (!text) return [];
  return text
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export function formatDate(date?: string): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
