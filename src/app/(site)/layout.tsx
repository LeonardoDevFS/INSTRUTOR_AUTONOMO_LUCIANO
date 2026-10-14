import type { ReactNode } from "react";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { JsonLd } from "@/components/seo/JsonLd";
import { siteConfig } from "@/config/site";
import { siteMedia } from "@/data/media";
import { getAbsoluteUrl } from "@/lib/seo/site-url";

type SiteLayoutProps = {
  children: ReactNode;
};

export default function SiteLayout({ children }: SiteLayoutProps) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": getAbsoluteUrl("/#organization"),
    name: `${siteConfig.name} — ${siteConfig.profession}`,
    alternateName: siteConfig.brand,
    url: getAbsoluteUrl(),
    logo: getAbsoluteUrl(siteMedia.branding.logo),
    image: getAbsoluteUrl(siteMedia.hero.src),
    description: siteConfig.description,
    telephone: `+${siteConfig.contact.phoneE164}`,
    brand: {
      "@type": "Brand",
      name: siteConfig.brand,
    },
    founder: {
      "@type": "Person",
      name: siteConfig.name,
      jobTitle: siteConfig.profession,
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: `+${siteConfig.contact.phoneE164}`,
      contactType: "customer service",
      availableLanguage: "Portuguese",
    },
    areaServed: {
      "@type": "City",
      name: siteConfig.location.city,
      containedInPlace: {
        "@type": "State",
        name: siteConfig.location.stateFullName,
      },
    },
    sameAs: [
      siteConfig.contact.instagramUrl,
      siteConfig.contact.googleMapsUrl,
    ],
  };

  return (
    <>
      <JsonLd data={organizationSchema} />
      <a
        href="#conteudo-principal"
        className="skip-link"
      >
        Ir para o conteúdo principal
      </a>

      <Header />

      <main id="conteudo-principal" tabIndex={-1}>
        {children}
      </main>

      <Footer />

      <WhatsAppFloat />
    </>
  );
}
