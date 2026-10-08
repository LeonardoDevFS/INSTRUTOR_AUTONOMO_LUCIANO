import type { Metadata } from "next";

import { ServiceDetailPage } from "@/components/sections/ServiceDetailPage";
import { servicePages } from "@/data/service-pages";

const content = servicePages.moto;

export const metadata: Metadata = {
  title: "Aulas de Moto em Itajubá",
  description:
    "Aulas práticas de moto com atendimento individual em Itajubá/MG e região. Treinamento para categoria A, exame e habilitados.",
  alternates: { canonical: "/aulas/moto" },
};

export default function MotorcycleLessonsPage() {
  return <ServiceDetailPage content={content} />;
}
