import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";

import { siteConfig } from "@/config/site";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  variable: "--font-barlow",
  weight: ["600", "700", "800"],
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: siteConfig.seo.defaultTitle,
    template: siteConfig.seo.titleTemplate,
  },

  description: siteConfig.description,

  openGraph: {
    title: siteConfig.seo.defaultTitle,
    description: siteConfig.description,
    locale: "pt_BR",
    type: "website",
    siteName: "Luciano Oliveira - Direção Segura",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`
          ${inter.variable}
          ${barlowCondensed.variable}
          bg-background
          text-foreground
          antialiased
        `}
      >
        {children}
      </body>
    </html>
  );
}