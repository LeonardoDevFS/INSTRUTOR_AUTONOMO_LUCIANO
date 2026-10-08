import { siteMedia } from "@/data/media";

export type ServicePageKey =
  | "carro"
  | "moto"
  | "habilitados"
  | "preparacao-prova-pratica";

export type ServicePageContent = {
  eyebrow: string;
  title: string;
  description: string;
  category?: string;
  placeholderTitle: string;
  placeholderDescription: string;
  imageSrc: string;
  imageAlt: string;
  imagePosition?: string;
  introTitle: string;
  introParagraphs: readonly string[];
  idealForTitle: string;
  idealFor: readonly string[];
  trainingTitle: string;
  trainingItems: readonly string[];
  whatsappMessage: string;
  meetingType: "beginner" | "exam";
};

export const servicePages: Record<ServicePageKey, ServicePageContent> = {
  carro: {
    eyebrow: "Categoria B",
    title: "Aulas de carro em Itajubá para aprender no seu ritmo.",
    description:
      "Treinamento prático e individual para desenvolver controle, atenção e confiança ao volante.",
    category: "B",
    placeholderTitle: "Treinamento de carro",
    placeholderDescription:
      "Composição visual fornecida para representar o treinamento da categoria B.",
    imageSrc: siteMedia.car.src,
    imageAlt: siteMedia.car.alt,
    imagePosition: siteMedia.car.objectPosition,
    introTitle: "Treinamento construído a partir da sua necessidade.",
    introParagraphs: [
      "Cada aluno chega com uma experiência diferente. Por isso, as aulas são organizadas de acordo com o momento, as dificuldades e os objetivos combinados diretamente com Luciano.",
      "O trabalho pode apoiar quem está aprendendo, quem se prepara para o exame prático ou quem deseja aperfeiçoar pontos específicos da condução.",
    ],
    idealForTitle: "Para quem são as aulas",
    idealFor: [
      "Alunos em etapa prática da primeira habilitação",
      "Candidatos em preparação para o exame",
      "Pessoas em processo de adição da categoria B",
      "Habilitados que querem recuperar a prática",
    ],
    trainingTitle: "O que pode ser trabalhado",
    trainingItems: [
      "Controle e adaptação ao veículo",
      "Arrancadas, paradas e trocas de marcha",
      "Manobras e estacionamento",
      "Subidas, cruzamentos e circulação no trânsito",
      "Dificuldades específicas identificadas durante as aulas",
    ],
    whatsappMessage:
      "Olá, Luciano! Gostaria de saber mais sobre as aulas de carro.",
    meetingType: "beginner",
  },
  moto: {
    eyebrow: "Categoria A",
    title: "Aulas de moto com orientação individual e prática consciente.",
    description:
      "Treinamento para desenvolver domínio, coordenação e mais confiança na categoria A.",
    category: "A",
    placeholderTitle: "Treinamento de moto",
    placeholderDescription:
      "Composição visual fornecida para representar o treinamento da categoria A.",
    imageSrc: siteMedia.motorcycle.src,
    imageAlt: siteMedia.motorcycle.alt,
    imagePosition: siteMedia.motorcycle.objectPosition,
    introTitle: "Evolução gradual sobre duas rodas.",
    introParagraphs: [
      "O treinamento é adaptado ao nível do aluno, respeitando o tempo necessário para compreender os comandos e desenvolver maior controle da motocicleta.",
      "As aulas podem atender candidatos em formação, pessoas adicionando a categoria A e habilitados que desejam retomar ou aperfeiçoar a prática.",
    ],
    idealForTitle: "Para quem são as aulas",
    idealFor: [
      "Alunos em etapa prática da primeira habilitação",
      "Candidatos em preparação para o exame",
      "Pessoas em processo de adição da categoria A",
      "Habilitados que querem voltar a pilotar",
    ],
    trainingTitle: "O que pode ser trabalhado",
    trainingItems: [
      "Adaptação aos comandos da motocicleta",
      "Controle, equilíbrio e coordenação",
      "Arrancadas, frenagens e mudanças de direção",
      "Condução progressiva de acordo com a experiência",
      "Dificuldades específicas identificadas durante as aulas",
    ],
    whatsappMessage:
      "Olá, Luciano! Gostaria de saber mais sobre as aulas de moto.",
    meetingType: "beginner",
  },
  habilitados: {
    eyebrow: "Treinamento para habilitados",
    title: "Volte a dirigir com acompanhamento e sem julgamentos.",
    description:
      "Aulas personalizadas para quem possui CNH, mas perdeu a prática ou ainda se sente inseguro em determinadas situações.",
    placeholderTitle: "Treinamento para habilitados",
    placeholderDescription:
      "Luciano Oliveira, instrutor autônomo da Direção Segura.",
    imageSrc: siteMedia.hero.src,
    imageAlt: siteMedia.hero.alt,
    imagePosition: siteMedia.hero.objectPosition,
    introTitle: "Seu ponto de partida é respeitado.",
    introParagraphs: [
      "Ter CNH não significa que todas as situações do trânsito sejam confortáveis. Tempo sem dirigir, pouca prática ou uma dificuldade específica podem tornar a retomada mais desafiadora.",
      "O treinamento é gradual e definido conforme a necessidade do aluno, sem promessas de prazo ou resultado garantido.",
    ],
    idealForTitle: "Situações comuns",
    idealFor: [
      "Muito tempo sem dirigir",
      "Insegurança para dirigir sozinho",
      "Dificuldade com estacionamento ou manobras",
      "Receio de subidas, cruzamentos ou vias movimentadas",
    ],
    trainingTitle: "Como o treinamento pode ajudar",
    trainingItems: [
      "Retomada gradual dos comandos e da circulação",
      "Prática em situações escolhidas com o aluno",
      "Treino de estacionamento e manobras",
      "Adaptação a trajetos e condições de trânsito",
      "Acompanhamento individual durante a evolução",
    ],
    whatsappMessage:
      "Olá, Luciano! Já tenho CNH e gostaria de conversar sobre um treinamento para voltar a dirigir com mais segurança.",
    meetingType: "beginner",
  },
  "preparacao-prova-pratica": {
    eyebrow: "Preparação para o exame",
    title: "Treine suas dificuldades antes da prova prática.",
    description:
      "Aulas focadas nos pontos que precisam de mais atenção, sem promessas de aprovação ou atalhos.",
    placeholderTitle: "Preparação para prova prática",
    placeholderDescription:
      "Composição visual fornecida para representar o treinamento de carro.",
    imageSrc: siteMedia.carFront.src,
    imageAlt: siteMedia.carFront.alt,
    imagePosition: siteMedia.carFront.objectPosition,
    introTitle: "Foco no que ainda precisa evoluir.",
    introParagraphs: [
      "A preparação é direcionada pelas dificuldades percebidas pelo aluno e observadas durante o treinamento, permitindo trabalhar pontos específicos antes do exame.",
      "O objetivo é chegar à avaliação com mais clareza sobre os procedimentos praticados e com melhor adaptação às situações treinadas.",
    ],
    idealForTitle: "Quando procurar esse treinamento",
    idealFor: [
      "Quando há dificuldade persistente em algum procedimento",
      "Para revisar pontos práticos antes do exame",
      "Após uma tentativa, para trabalhar os pontos identificados",
      "Quando o aluno deseja uma orientação mais individual",
    ],
    trainingTitle: "O que pode ser revisado",
    trainingItems: [
      "Procedimentos e dificuldades relatadas pelo aluno",
      "Controle do veículo durante as manobras",
      "Atenção, observação e sequência das ações",
      "Treinamento na região utilizada nessa fase",
      "Revisão personalizada conforme a evolução",
    ],
    whatsappMessage:
      "Olá, Luciano! Gostaria de saber mais sobre a preparação para a prova prática.",
    meetingType: "exam",
  },
};
