import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/", "/membros", "/checkout"],
    },
    sitemap: "https://jfv.smdigtal.com/sitemap.xml",
  };
}
