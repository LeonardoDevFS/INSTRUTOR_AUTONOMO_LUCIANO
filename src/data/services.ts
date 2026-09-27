export type Service = {
  id: string;
  title: string;
  shortTitle: string;
  href: string;
  description: string;
  category?: string;
};

export const services: Service[] = [
  {
    id: "carro",
    title: "Aulas de Carro",
    shortTitle: "Carro",
    href: "/aulas/carro",
    category: "B",
    description:
      "Aulas práticas personalizadas para quem está aprendendo, se preparando para o exame ou deseja aperfeiçoar sua direção.",
  },

  {
    id: "moto",
    title: "Aulas de Moto",
    shortTitle: "Moto",
    href: "/aulas/moto",
    category: "A",
    description:
      "Treinamento prático para desenvolver controle, segurança e confiança na motocicleta.",
  },

  {
    id: "habilitados",
    title: "Treinamento para Habilitados",
    shortTitle: "Habilitados",
    href: "/aulas/habilitados",
    description:
      "Treinamento personalizado para quem já possui CNH, mas perdeu prática ou ainda não se sente seguro dirigindo.",
  },

  {
    id: "prova-pratica",
    title: "Preparação para Prova Prática",
    shortTitle: "Prova Prática",
    href: "/aulas/preparacao-prova-pratica",
    description:
      "Treinamento focado nas dificuldades do aluno e na preparação para o exame prático.",
  },

  {
    id: "adicao-categoria",
    title: "Adição de Categoria",
    shortTitle: "Adição",
    href: "/guias/adicao-de-categoria-mg",
    description:
      "Para quem já possui habilitação e deseja adicionar uma nova categoria à CNH.",
  },

  {
    id: "mentoria",
    title: "Mentoria Teórica",
    shortTitle: "Mentoria",
    href: "/mentoria",
    description:
      "Orientação teórica online para candidatos que precisam de ajuda durante a preparação para a habilitação.",
  },
];