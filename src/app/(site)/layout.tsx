import type { ReactNode } from "react";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { JsonLd, type JsonLdObject } from "@/components/seo/JsonLd";
import { siteConfig } from "@/config/site";
import { siteMedia } from "@/data/media";
import { services } from "@/data/services";
import { getAbsoluteUrl } from "@/lib/seo/site-url";

type SiteLayoutProps = {
  children: ReactNode;
};

export default function SiteLayout({ children }: SiteLayoutProps) {
  const organizationId = getAbsoluteUrl("/#organization");
  const personId = getAbsoluteUrl("/#person");
  const websiteId = getAbsoluteUrl("/#website");
  const serviceArea = {
    "@type": "City",
    name: siteConfig.location.city,
    containedInPlace: {
      "@type": "State",
      name: siteConfig.location.stateFullName,
    },
  };

  const entitySchema: JsonLdObject = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: siteConfig.brand,
        alternateName: `${siteConfig.name} — ${siteConfig.profession}`,
        url: getAbsoluteUrl(),
        logo: {
          "@type": "ImageObject",
          url: getAbsoluteUrl(siteMedia.branding.logo),
        },
        image: getAbsoluteUrl(siteMedia.branding.logo),
        description: siteConfig.description,
        telephone: `+${siteConfig.contact.phoneE164}`,
        founder: { "@id": personId },
        contactPoint: {
          "@type": "ContactPoint",
          telephone: `+${siteConfig.contact.phoneE164}`,
          contactType: "customer service",
          availableLanguage: "pt-BR",
          areaServed: "BR",
        },
        areaServed: serviceArea,
        sameAs: [
          siteConfig.contact.instagramUrl,
          siteConfig.contact.googleMapsUrl,
        ],
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Aulas e treinamentos de direção",
          itemListElement: services.map((service) => ({
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: service.title,
              description: service.description,
              url: getAbsoluteUrl(service.href),
              provider: { "@id": organizationId },
              areaServed: serviceArea,
            },
          })),
        },
      },
      {
        "@type": "Person",
        "@id": personId,
        name: siteConfig.name,
        jobTitle: siteConfig.profession,
        url: getAbsoluteUrl("/sobre"),
        worksFor: { "@id": organizationId },
        areaServed: serviceArea,
        knowsAbout: services.map((service) => service.title),
        sameAs: [siteConfig.contact.instagramUrl],
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: getAbsoluteUrl(),
        name: `${siteConfig.brand} — ${siteConfig.name}`,
        description: siteConfig.description,
        inLanguage: "pt-BR",
        publisher: { "@id": organizationId },
      },
    ],
  };

  return (
    <>
      <JsonLd data={entitySchema} />
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
