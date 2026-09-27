import type { ReactNode } from "react";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";

type SiteLayoutProps = {
  children: ReactNode;
};

export default function SiteLayout({ children }: SiteLayoutProps) {
  return (
    <>
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
