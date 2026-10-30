import { ServiceDetailPage } from "@/components/sections/ServiceDetailPage";
import { servicePages } from "@/data/service-pages";
import { createPageMetadata } from "@/lib/seo/metadata";

const content = servicePages.carro;

export const metadata = createPageMetadata({
  title: "Aulas de Carro em Itajubá",
  description:
    "Aulas práticas de carro com atendimento individual em Itajubá/MG e região. Treinamento para categoria B, exame e habilitados.",
  canonical: "/aulas/carro",
});

export default function CarLessonsPage() {
  return <ServiceDetailPage content={content} />;
}
