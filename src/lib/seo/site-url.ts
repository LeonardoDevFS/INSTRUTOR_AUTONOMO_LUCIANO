import { siteConfig } from "@/config/site";

export function getSiteUrl() {
  if (process.env.NODE_ENV === "production") return siteConfig.siteUrl;

  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (configuredUrl) return configuredUrl;

  return "http://localhost:3000";
}

export function getAbsoluteUrl(path = "/") {
  return new URL(path, getSiteUrl()).toString();
}
