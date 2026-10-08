export type BlogPostSection = {
  title: string;
  paragraphs: readonly string[];
  items?: readonly string[];
};

export type BlogPost = {
  slug: string;
  category: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt: string;
  displayDate: string;
  introduction: readonly string[];
  sections: readonly BlogPostSection[];
  takeaway: string;
  relatedHref: string;
  relatedLabel: string;
};

export const blogPosts = [
  {
    slug: "como-aproveitar-hora-aula-de-direcao",
    category: "Aulas práticas",
    title: "Como aproveitar melhor uma hora/aula de direção",
    description:
      "Um roteiro simples para chegar à aula com um objetivo claro, usar bem os 50 minutos e acompanhar sua evolução sem tentar treinar tudo ao mesmo tempo.",
    publishedAt: "2026-10-07",
    updatedAt: "2026-10-07",
    displayDate: "7 de outubro de 2026",
    introduction: [
      "Uma aula prática rende mais quando começa com uma prioridade definida. Isso não significa transformar o aprendizado em uma corrida, mas usar o tempo para observar, praticar, receber orientação e entender qual será o próximo passo.",
      "Na Direção Segura, cada hora/aula tem 50 minutos. O conteúdo pode ser adaptado ao momento do aluno, seja no início da habilitação, na preparação para a prova ou na retomada de quem já possui CNH.",
    ],
    sections: [
      {
        title: "Escolha um objetivo observável",
        paragraphs: [
          "Antes da aula, pense em uma situação concreta que deseja trabalhar. Em vez de usar um objetivo amplo como “dirigir melhor”, identifique algo que possa ser praticado e comentado ao final.",
        ],
        items: [
          "iniciar e parar o veículo com mais controle;",
          "organizar a sequência de observação em cruzamentos;",
          "treinar estacionamento ou manobras;",
          "praticar subidas e controle de velocidade;",
          "retomar contato com o trânsito depois de um período sem dirigir.",
        ],
      },
      {
        title: "Conte como você chega naquele dia",
        paragraphs: [
          "A mesma pessoa pode chegar mais segura em uma aula e mais tensa em outra. Avisar sobre dúvidas, dificuldades recentes ou situações que deseja evitar ajuda o instrutor a escolher uma progressão compatível com aquele momento.",
          "Essa conversa inicial também evita gastar boa parte da aula tentando descobrir qual é a prioridade real.",
        ],
      },
      {
        title: "Repita com propósito, não no automático",
        paragraphs: [
          "Repetir uma manobra é útil quando cada tentativa responde a uma pergunta: o que funcionou, onde houve hesitação e qual ajuste será testado agora? Sem esse retorno, a repetição pode apenas reforçar o mesmo erro.",
          "Procure entender os pontos de referência e a sequência de decisões, em vez de decorar movimentos sem contexto.",
        ],
      },
      {
        title: "Use os minutos finais para fechar a aula",
        paragraphs: [
          "Ao terminar, tente resumir o principal aprendizado com suas próprias palavras. Pergunte o que merece continuidade e registre uma ou duas observações simples para não depender apenas da memória até a próxima aula.",
        ],
        items: [
          "qual habilidade apresentou evolução;",
          "qual situação ainda exige atenção;",
          "qual será a prioridade sugerida para o próximo encontro.",
        ],
      },
      {
        title: "Evite transformar uma aula em uma prova",
        paragraphs: [
          "A aula é um espaço de treinamento. Errar, interromper uma tentativa e repetir com orientação faz parte do processo. Medir o aprendizado apenas pelo número de acertos pode esconder avanços importantes, como perceber um risco mais cedo ou tomar uma decisão com mais calma.",
        ],
      },
    ],
    takeaway:
      "Uma aula produtiva não precisa abordar tudo. Ela precisa ter um objetivo compreensível, prática orientada e um próximo passo claro.",
    relatedHref: "/aulas",
    relatedLabel: "Conhecer as modalidades de aula",
  },
  {
    slug: "como-organizar-aulas-antes-da-prova-pratica",
    category: "Preparação prática",
    title: "Como organizar as aulas antes da prova prática",
    description:
      "Saiba como transformar as aulas finais em uma revisão objetiva, priorizando consistência, tomada de decisão e dificuldades que realmente precisam de atenção.",
    publishedAt: "2026-10-07",
    updatedAt: "2026-10-07",
    displayDate: "7 de outubro de 2026",
    introduction: [
      "A proximidade da prova prática costuma aumentar a vontade de revisar tudo de uma vez. Porém, uma preparação mais organizada começa identificando quais etapas já estão consistentes e quais ainda geram dúvida ou quebra de sequência.",
      "O treinamento complementar não substitui as orientações oficiais do processo de habilitação. Seu papel é ajudar o aluno a usar o tempo de prática com foco e compreender melhor as próprias dificuldades.",
    ],
    sections: [
      {
        title: "Faça um diagnóstico antes de aumentar a repetição",
        paragraphs: [
          "Mais tentativas nem sempre significam melhor preparação. Primeiro, observe onde a execução perde fluidez: pode ser na leitura do ambiente, na coordenação dos comandos, na sequência da manobra ou na pressa para terminar.",
          "Quando a causa fica mais clara, o exercício pode ser escolhido de forma específica.",
        ],
      },
      {
        title: "Separe dificuldade técnica de ansiedade",
        paragraphs: [
          "Uma etapa pode estar tecnicamente compreendida e ainda assim ficar instável quando o aluno se sente observado ou tenta executar tudo rápido demais. Nesses casos, é útil praticar a sequência em ritmo controlado e verbalizar os pontos de atenção.",
          "Se existir uma dificuldade técnica, ela deve ser trabalhada diretamente, sem esconder o problema em uma simulação completa repetida muitas vezes.",
        ],
      },
      {
        title: "Treine sequências completas depois dos ajustes",
        paragraphs: [
          "Depois de corrigir pontos isolados, vale reuni-los novamente em uma condução mais contínua. Isso ajuda a perceber se a habilidade aparece no momento certo e se o aluno consegue manter observação, controle e tomada de decisão ao mesmo tempo.",
        ],
      },
      {
        title: "Priorize consistência em vez de uma tentativa perfeita",
        paragraphs: [
          "Uma execução ocasionalmente perfeita diz menos do que várias tentativas estáveis. O objetivo das aulas finais deve ser reduzir dúvidas recorrentes e construir uma sequência que o aluno compreenda, sem depender de sorte ou pressa.",
        ],
        items: [
          "mantenha uma ordem clara de observação e ação;",
          "confirme os pontos de referência usados no treinamento;",
          "peça retorno sobre erros que se repetem;",
          "evite incluir muitas mudanças importantes na mesma tentativa.",
        ],
      },
      {
        title: "Termine a preparação sabendo o que preservar",
        paragraphs: [
          "Além de saber o que corrigir, o aluno precisa reconhecer o que já funciona. Essa percepção evita mudanças desnecessárias perto da avaliação e ajuda a manter uma condução mais organizada.",
          "As exigências e instruções oficiais da prova devem sempre ser confirmadas nos canais responsáveis pelo processo de habilitação.",
        ],
      },
    ],
    takeaway:
      "As aulas finais funcionam melhor como uma revisão orientada: diagnosticar, ajustar, integrar e preservar o que já está consistente.",
    relatedHref: "/aulas/preparacao-prova-pratica",
    relatedLabel: "Ver preparação para prova prática",
  },
] as const satisfies readonly BlogPost[];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export function getBlogPostReadingTime(post: BlogPost) {
  const text = [
    post.title,
    post.description,
    ...post.introduction,
    ...post.sections.flatMap((section) => [
      section.title,
      ...section.paragraphs,
      ...(section.items ?? []),
    ]),
    post.takeaway,
  ].join(" ");

  return Math.max(3, Math.ceil(text.trim().split(/\s+/).length / 200));
}
