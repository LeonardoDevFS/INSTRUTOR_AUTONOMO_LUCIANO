import type { MetadataRoute } from "next";

import { blogPosts } from "@/data/blog-posts";
import { getAbsoluteUrl } from "@/lib/seo/site-url";

const routes = [
  "/",
  "/sobre",
  "/aulas",
  "/aulas/carro",
  "/aulas/moto",
  "/aulas/habilitados",
  "/aulas/preparacao-prova-pratica",
  "/mentoria",
  "/guias",
  "/guias/primeira-cnh-minas-gerais",
  "/guias/adicao-de-categoria-mg",
  "/guias/medo-de-dirigir",
  "/resultados",
  "/agendar",
  "/blog",
  "/contato",
  "/politica-de-privacidade",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    ...routes.map((route) => ({
      url: getAbsoluteUrl(route),
      lastModified,
      changeFrequency: route === "/" ? ("weekly" as const) : ("monthly" as const),
      priority: route === "/" ? 1 : route === "/agendar" ? 0.9 : 0.7,
    })),
    ...blogPosts.map((post) => ({
      url: getAbsoluteUrl(`/blog/${post.slug}`),
      lastModified: new Date(`${post.updatedAt}T12:00:00-03:00`),
      changeFrequency: "monthly" as const,
      priority: 0.65,
    })),
  ];
}
