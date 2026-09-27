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
      <Header />

      <main>{children}</main>

      <Footer />

      <WhatsAppFloat />
    </>
  );
}