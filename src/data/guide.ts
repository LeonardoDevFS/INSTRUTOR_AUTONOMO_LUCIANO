export type Guide = {
  id: string;
  title: string;
  description: string;
  href: string;
};

export const guides: Guide[] = [
  {
    id: "primeira-cnh",
    title: "Como tirar a primeira CNH em Minas Gerais",
    href: "/guias/primeira-cnh-minas-gerais",
    description:
      "Um passo a passo completo para entender o processo da primeira habilitação em Minas Gerais.",
  },

  {
    id: "adicao-categoria",
    title: "Como funciona a adição de categoria",
    href: "/guias/adicao-de-categoria-mg",
    description:
      "Já possui habilitação? Entenda como funciona o processo para adicionar uma nova categoria.",
  },

  {
    id: "medo-dirigir",
    title: "Tenho medo de dirigir. E agora?",
    href: "/guias/medo-de-dirigir",
    description:
      "Entenda como funciona o treinamento para habilitados que ainda não se sentem seguros no trânsito.",
  },
];