import type { Metadata } from "next";

import { ServiceDetailPage } from "@/components/sections/ServiceDetailPage";
import { servicePages } from "@/data/service-pages";

const content = servicePages.habilitados;

export const metadata: Metadata = {
  title: "Aulas para Habilitados em Itajubá",
  description:
    "Treinamento personalizado em Itajubá/MG para pessoas habilitadas que perderam a prática ou sentem insegurança para dirigir.",
  alternates: { canonical: "/aulas/habilitados" },
};

export default function LicensedDriversPage() {
  return <ServiceDetailPage content={content} />;
}
