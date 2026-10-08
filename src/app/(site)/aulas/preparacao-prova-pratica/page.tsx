import type { Metadata } from "next";

import { ServiceDetailPage } from "@/components/sections/ServiceDetailPage";
import { servicePages } from "@/data/service-pages";

const content = servicePages["preparacao-prova-pratica"];

export const metadata: Metadata = {
  title: "Preparação para Prova Prática em Itajubá",
  description:
    "Treinamento individual em Itajubá/MG para revisar dificuldades e se preparar para a prova prática de direção.",
  alternates: { canonical: "/aulas/preparacao-prova-pratica" },
};

export default function PracticalTestPreparationPage() {
  return <ServiceDetailPage content={content} />;
}
