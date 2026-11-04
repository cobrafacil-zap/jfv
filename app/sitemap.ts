import type { MetadataRoute } from "next";

const SITE_URL = "https://jfv.smdigtal.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const agora = new Date();

  return [
    {
      url: SITE_URL,
      lastModified: agora,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/aplicacao`,
      lastModified: agora,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/aceleracao`,
      lastModified: agora,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/login`,
      lastModified: agora,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
