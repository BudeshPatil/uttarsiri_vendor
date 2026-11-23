import type { MetadataRoute } from "next";
import { SITE } from "@/constants/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE.url;
  const staticPages = ["", "/about", "/services", "/portfolio", "/blogs", "/contact"];

  return staticPages.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.8,
  }));
}
