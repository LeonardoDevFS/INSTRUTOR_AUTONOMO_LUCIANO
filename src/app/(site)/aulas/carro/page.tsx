import type { Metadata } from "next";

import { ServiceDetailPage } from "@/components/sections/ServiceDetailPage";
import { servicePages } from "@/data/service-pages";

const content = servicePages.carro;

export const metadata: Metadata = {
  title: "Aulas de Carro em Itajubá",
  description:
    "Aulas práticas de carro com atendimento individual em Itajubá/MG e região. Treinamento para categoria B, exame e habilitados.",
  alternates: { canonical: "/aulas/carro" },
};

export default function CarLessonsPage() {
  return <ServiceDetailPage content={content} />;
}
