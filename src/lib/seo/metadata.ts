import type { Metadata } from "next";

import { siteConfig } from "@/config/site";

type PageMetadataOptions = {
  title: string;
  description: string;
  canonical: string;
  absoluteTitle?: boolean;
  openGraphTitle?: string;
  openGraphDescription?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
};

export function createPageMetadata({
  title,
  description,
  canonical,
  absoluteTitle = false,
  openGraphTitle,
  openGraphDescription,
  type = "website",
  publishedTime,
  modifiedTime,
}: PageMetadataOptions): Metadata {
  const socialTitle = openGraphTitle ?? title;
  const socialDescription = openGraphDescription ?? description;

  const openGraph: Metadata["openGraph"] =
    type === "article"
      ? {
          type: "article",
          title: socialTitle,
          description: socialDescription,
          url: canonical,
          locale: "pt_BR",
          siteName: `${siteConfig.name} - ${siteConfig.brand}`,
          publishedTime,
          modifiedTime,
        }
      : {
          type: "website",
          title: socialTitle,
          description: socialDescription,
          url: canonical,
          locale: "pt_BR",
          siteName: `${siteConfig.name} - ${siteConfig.brand}`,
        };

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical },
    openGraph,
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: socialDescription,
    },
  };
}
