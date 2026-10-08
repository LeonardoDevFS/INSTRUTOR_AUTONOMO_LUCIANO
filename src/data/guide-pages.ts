export type GuideStep = {
  title: string;
  description: string;
};

export const guideReviewDate = "4 de outubro de 2026";

export const officialGuideSources = {
  firstLicense: {
    title: "Obter a 1ª habilitação: CNH ou ACC — Portal MG",
    url: "https://www.mg.gov.br/servico/obter-1a-habilitacao-cnh-ou-acc",
    officialUpdatedAt: "9 de setembro de 2026",
  },
  categoryAddition: {
    title: "Adicionar categoria A ou B, ou ACC — Portal MG",
    url: "https://www.mg.gov.br/servico/adicionar-categoria-ou-b-ou-acc",
    officialUpdatedAt: "30 de abril de 2026",
  },
} as const;

export const firstLicenseSteps: readonly GuideStep[] = [
  {
    title: "Cadastro e taxa inicial",
    description:
      "Preencha o formulário oficial para cadastro em Minas Gerais e emissão do DAE. Confirme o valor atualizado diretamente no Portal MG antes do pagamento.",
  },
  {
    title: "Biometria e exames",
    description:
      "Depois da compensação, agende coleta biométrica, exame médico e avaliação psicológica. O portal informa que a clínica é definida pelo sistema; a pessoa escolhe data e horário.",
  },
  {
    title: "Curso de legislação",
    description:
      "O curso pode ser feito gratuitamente pelo aplicativo CNH do Brasil ou por CFC credenciado, presencialmente ou a distância, conforme as opções oficiais vigentes.",
  },
  {
    title: "Prova de legislação",
    description:
      "Após concluir as etapas anteriores, emita a taxa aplicável, agende a prova e compareça com documento oficial com foto. O Portal MG informa aprovação com pontuação igual ou superior a 20 pontos.",
  },
  {
    title: "Aulas práticas",
    description:
      "Após a liberação da etapa prática, escolha um CFC ou instrutor autônomo habilitado. Na consulta oficial desta página, a exigência informada para CNH é de no mínimo 2 horas/aula.",
  },
  {
    title: "Prova de direção",
    description:
      "Emita e pague a taxa vigente e solicite o agendamento. O dia, horário e local são disponibilizados pelo Detran-MG; para categoria A, a avaliação ocorre em motopista.",
  },
  {
    title: "Permissão para Dirigir",
    description:
      "Com a aprovação, é emitida a Permissão para Dirigir (PPD), válida por 12 meses. A emissão posterior da CNH depende do cumprimento das regras de infrações nesse período.",
  },
] as const;

export const categoryAdditionSteps: readonly GuideStep[] = [
  {
    title: "Confira prontuário e endereço",
    description:
      "Verifique se não há bloqueio e mantenha o endereço atualizado. O Portal MG também informa restrição para quem teve mais de uma infração gravíssima nos últimos 12 meses.",
  },
  {
    title: "Abra o processo e pague o DAE",
    description:
      "Faça a solicitação no formulário oficial e gere a taxa correspondente. Consulte o valor vigente no Portal MG antes de pagar.",
  },
  {
    title: "Agende os exames aplicáveis",
    description:
      "O exame médico é obrigatório. A avaliação psicológica é indicada pelo portal para quem exerce atividade remunerada com o veículo; situações de categorias C, D ou E podem exigir exame toxicológico.",
  },
  {
    title: "Faça o cadastro para a etapa prática",
    description:
      "Após os resultados e a liberação, siga a orientação oficial para cadastro da etapa prática e emissão da Licença de Aprendizagem de Direção Veicular (LADV).",
  },
  {
    title: "Realize as aulas práticas",
    description:
      "Na página oficial consultada, a adição das categorias A ou B exige no mínimo 2 horas/aula, incluindo 1 hora/aula no período noturno. Confirme a regra antes de iniciar, pois ela pode mudar.",
  },
  {
    title: "Faça a prova de direção",
    description:
      "Pague a taxa vigente e solicite o agendamento conforme o fluxo oficial. O local, a data e o horário são disponibilizados pelo Detran-MG.",
  },
  {
    title: "Acompanhe o novo documento",
    description:
      "Após a aprovação e conclusão do processo, acompanhe a emissão e entrega da CNH atualizada pelos canais oficiais.",
  },
] as const;

export const fearOfDrivingSituations = [
  "Voltar a dirigir depois de muito tempo",
  "Estacionar e fazer manobras",
  "Enfrentar subidas e cruzamentos",
  "Circular em vias movimentadas",
  "Dirigir sozinho",
  "Retomar trajetos do dia a dia",
] as const;
