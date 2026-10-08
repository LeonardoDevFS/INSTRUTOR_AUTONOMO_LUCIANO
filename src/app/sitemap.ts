import type { MetadataRoute } from "next";

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

  return routes.map((route) => ({
    url: getAbsoluteUrl(route),
    lastModified,
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : route === "/agendar" ? 0.9 : 0.7,
  }));
}
