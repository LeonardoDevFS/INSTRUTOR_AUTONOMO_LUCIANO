import type { SiteConfig } from "@/config/site";

export type HomeGoalIcon =
  | "first-license"
  | "motorcycle"
  | "licensed"
  | "mentorship"
  | "addition";

export type HomeGoal = {
  title: string;
  description: string;
  href: string;
  icon: HomeGoalIcon;
};

export const homeGoals: HomeGoal[] = [
  {
    title: "Primeira habilitação",
    description: "Entenda as etapas e prepare-se para começar com clareza.",
    href: "/guias/primeira-cnh-minas-gerais",
    icon: "first-license",
  },
  {
    title: "Aulas de moto",
    description: "Desenvolva controle e segurança para a categoria A.",
    href: "/aulas/moto",
    icon: "motorcycle",
  },
  {
    title: "Já sou habilitado",
    description: "Retome a prática no seu ritmo e nas situações que precisa.",
    href: "/aulas/habilitados",
    icon: "licensed",
  },
  {
    title: "Mentoria teórica",
    description: "Organize seus estudos e tire dúvidas sobre a etapa teórica.",
    href: "/mentoria",
    icon: "mentorship",
  },
  {
    title: "Adição de categoria",
    description: "Saiba como avançar da categoria A para B ou de B para A.",
    href: "/guias/adicao-de-categoria-mg",
    icon: "addition",
  },
];

export const authorityHighlights = [
  "Experiência em sala de aula e na prática",
  "Atendimento individual e personalizado",
  "Treinamento para carro e moto",
  "Atuação em Itajubá/MG e região",
] as const;

export const mentorshipTopics = [
  "Legislação",
  "Sinalização",
  "Direção defensiva",
  "Primeiros socorros",
  "Mecânica básica",
  "Dúvidas e simulados",
] as const;

export const licensedTrainingTopics = [
  "Retomada da prática",
  "Estacionamento",
  "Trânsito e cruzamentos",
  "Subidas",
  "Vias movimentadas",
  "Dirigir sozinho",
] as const;

export const bookingSteps = [
  "Escolha dia e horário",
  "Informe seus dados",
  "Indique o serviço",
  "Confirme no Google",
  "Reserva na agenda",
] as const;

export type HomeFaqItem = {
  question: string;
  answer: string;
};

export function createHomeFaqItems(config: SiteConfig): HomeFaqItem[] {
  return [
    {
      question: "Quanto tempo dura cada aula?",
      answer: `Cada hora/aula tem ${config.lesson.durationMinutes} minutos. A frequência costuma ser combinada de acordo com a necessidade de cada aluno.`,
    },
    {
      question: "Há aulas de carro e de moto?",
      answer: `Sim. Luciano trabalha com as categorias ${config.categories.join(" e ")}, oferecendo treinamento de carro e moto.`,
    },
    {
      question: "Quem já tem CNH também pode fazer aulas?",
      answer:
        "Sim. O treinamento para habilitados é personalizado para quem perdeu a prática ou quer desenvolver mais segurança em situações específicas.",
    },
    {
      question: "Como funciona a mentoria teórica?",
      answer: config.mentorship.currentlyFree
        ? "A mentoria é online e, atualmente, gratuita. O atendimento presencial pode ser combinado conforme a disponibilidade."
        : "A mentoria é online. O atendimento presencial pode ser combinado conforme a disponibilidade.",
    },
    {
      question: "Quais são os horários de atendimento?",
      answer: `${config.schedule.weekdays.label}, das ${config.schedule.weekdays.opening} às ${config.schedule.weekdays.closing}; ${config.schedule.saturday.label.toLowerCase()}, das ${config.schedule.saturday.opening} às ${config.schedule.saturday.closing}.`,
    },
    {
      question: "É possível marcar uma aula no domingo?",
      answer:
        "Domingos são atendidos excepcionalmente, mediante consulta e disponibilidade. Fale diretamente com Luciano para verificar.",
    },
    {
      question: "Quais formas de pagamento são aceitas?",
      answer: `Dinheiro, PIX, débito e crédito. O pagamento pode ser parcelado em até ${config.payment.interestFreeInstallments}x sem juros ou até ${config.payment.maxInstallmentsWithInterest}x com juros.`,
    },
    {
      question: "Qual é a região de atendimento?",
      answer: `O atendimento acontece em ${config.location.serviceArea}. O ponto de encontro é combinado diretamente com o aluno conforme a etapa do treinamento.`,
    },
    {
      question: "Como faço para agendar?",
      answer:
        "Acesse a página de agendamento, escolha um horário disponível e conclua o formulário oficial do Google informando o serviço desejado. O WhatsApp permanece como alternativa para dúvidas, domingos e situações especiais.",
    },
  ];
}
