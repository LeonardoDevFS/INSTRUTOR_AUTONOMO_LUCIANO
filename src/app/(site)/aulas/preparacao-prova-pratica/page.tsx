import { ServiceDetailPage } from "@/components/sections/ServiceDetailPage";
import { servicePages } from "@/data/service-pages";
import { createPageMetadata } from "@/lib/seo/metadata";

const content = servicePages["preparacao-prova-pratica"];

export const metadata = createPageMetadata({
  title: "Preparação para Prova Prática em Itajubá",
  description:
    "Treinamento individual em Itajubá/MG para revisar dificuldades e se preparar para a prova prática de direção.",
  canonical: "/aulas/preparacao-prova-pratica",
});

export default function PracticalTestPreparationPage() {
  return <ServiceDetailPage content={content} />;
}
