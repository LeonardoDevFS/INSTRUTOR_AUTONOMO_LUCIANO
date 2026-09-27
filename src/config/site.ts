export const siteConfig = {
  name: "Luciano Oliveira",
  brand: "Direção Segura",
  profession: "Instrutor Autônomo",
  slogan: "Mais que dirigir, é evoluir.",

  description:
    "Aulas práticas de carro e moto, preparação para habilitação, treinamento para habilitados e mentoria teórica com Luciano Oliveira em Itajubá, Minas Gerais.",

  experienceYears: 27,
  categories: ["A", "B"],

  location: {
    city: "Itajubá",
    state: "MG",
    stateFullName: "Minas Gerais",
    country: "Brasil",
    serviceArea: "Itajubá e região",

    beginnerMeeting:
      "Ponto combinado com o aluno, com possibilidade de encontro próximo ao Parque de Itajubá.",

    examMeeting:
      "Região próxima ao Supermercado Pague Menos, em Itajubá.",
  },

  contact: {
    phoneDisplay: "(35) 99181-2056",
    phoneE164: "5535991812056",

    instagramUsername: "@inst_luciano",
    instagramUrl: "https://www.instagram.com/inst_luciano/",
  },

  schedule: {
    weekdays: {
      label: "Segunda a sexta",
      opening: "07:00",
      closing: "20:00",
    },

    saturday: {
      label: "Sábado",
      opening: "07:00",
      closing: "13:00",
    },

    sunday: {
      label: "Domingo",
      availableByRequest: true,
      message: "Atendimento aos domingos mediante disponibilidade.",
    },
  },

  lesson: {
    durationMinutes: 50,
    label: "1 hora/aula",
  },

  mentorship: {
    online: true,
    presencialByAvailability: true,
    currentlyFree: true,
  },

  payment: {
    pix: true,
    cash: true,
    debitCard: true,
    creditCard: true,

    interestFreeInstallments: 3,
    maxInstallmentsWithInterest: 18,
  },

  booking: {
    recommendedLessonsPerDay: 1,

    cancellationPolicy:
      "Cancelamentos e remarcações são combinados diretamente com o aluno.",
  },

  seo: {
    defaultTitle:
      "Luciano Oliveira | Instrutor Autônomo em Itajubá MG",

    titleTemplate: "%s | Luciano Oliveira - Direção Segura",
  },
} as const;

export type SiteConfig = typeof siteConfig;
