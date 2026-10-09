export type SiteMediaAsset = {
  src: string;
  alt: string;
  objectPosition?: string;
};

const carGallery = [
  {
    src: "/images/carro/carro semi perfil na estrada.png",
    alt: "Fiat Mobi utilizado nas aulas da categoria B em uma composição visual ao pôr do sol",
    objectPosition: "center center",
  },
  {
    src: "/images/carro/carro de frente na estrada .png",
    alt: "Vista frontal do Fiat Mobi utilizado nas aulas da categoria B",
    objectPosition: "center center",
  },
  {
    src: "/images/carro/carro perfil de costas na europa.png",
    alt: "Vista traseira lateral do Fiat Mobi utilizado nas aulas da categoria B",
    objectPosition: "center center",
  },
  {
    src: "/images/carro/carro semi perfil na estrada de gelo.png",
    alt: "Vista lateral frontal do Fiat Mobi utilizado nas aulas da categoria B",
    objectPosition: "center center",
  },
] as const satisfies readonly SiteMediaAsset[];

const motorcycleGallery = [
  {
    src: "/images/moto/moto perfil no japão.png",
    alt: "Vista lateral da Yamaha Factor 150 utilizada nas aulas da categoria A",
    objectPosition: "center center",
  },
  {
    src: "/images/moto/moto perfil no gelo.png",
    alt: "Vista lateral frontal da Yamaha Factor 150 utilizada nas aulas da categoria A",
    objectPosition: "center center",
  },
  {
    src: "/images/moto/moto perfil pra outro lado na névoa.png",
    alt: "Vista lateral oposta da Yamaha Factor 150 utilizada nas aulas da categoria A",
    objectPosition: "center center",
  },
  {
    src: "/images/moto/moto trás na europa.png",
    alt: "Vista traseira da Yamaha Factor 150 utilizada nas aulas da categoria A",
    objectPosition: "center center",
  },
] as const satisfies readonly SiteMediaAsset[];

export const siteMedia = {
  branding: {
    logo: "/images/branding/LOGO principal.png",
    icon: "/images/branding/LOGO ICO DO SITE.ico",
  },
  hero: {
    src: "/images/luciano/Luciano Principal.png",
    alt: "Luciano Oliveira em frente ao carro da Direção Segura ao pôr do sol",
    objectPosition: "center center",
  },
  professionalPortrait: {
    src: "/images/blog/foto profissional do Luciano.png",
    alt: "Retrato profissional de Luciano Oliveira ao lado de um veículo de treinamento",
    objectPosition: "center 28%",
  },
  mentorship: {
    src: "/images/mentoria/luciano dando aula.png",
    alt: "Luciano apresentando conteúdo sobre sinalização de trânsito em sala",
    objectPosition: "center center",
  },
  licensedTraining: {
    src: "/images/alunos/luciano dano aula no patio.png",
    alt: "Luciano acompanhando uma aula prática de motocicleta em um pátio de treinamento",
    objectPosition: "center center",
  },
  guidesCover: {
    src: "/images/guias/guia-cnh-direcao-segura.jpg",
    alt: "Arte informativa da Direção Segura sobre o guia completo para tirar a CNH",
    objectPosition: "center center",
  },
  practicalTest: {
    src: "/images/prova-pratica/luciano com pedro APROVADO.webp",
    alt: "Arte da Direção Segura celebrando a aprovação de Pedro ao lado de Luciano",
    objectPosition: "center center",
  },
  car: carGallery[0],
  carFront: carGallery[1],
  carGallery,
  motorcycle: motorcycleGallery[2],
  motorcycleGallery,
  vehicles: {
    src: "/images/estrada-cta/moto e carro na estrada.png",
    alt: "Composição visual do carro e da moto da Direção Segura em uma estrada ao pôr do sol",
    objectPosition: "center center",
  },
  results: [
    {
      src: "/images/habilitados/angel passou.webp",
      alt: "Arte da Direção Segura celebrando a aprovação de Angel ao lado de Luciano",
    },
    {
      src: "/images/habilitados/erick passou.webp",
      alt: "Arte da Direção Segura celebrando a aprovação de Erick ao lado de Luciano",
    },
    {
      src: "/images/habilitados/gustavo passou.webp",
      alt: "Arte da Direção Segura celebrando a aprovação de Gustavo ao lado de Luciano",
    },
    {
      src: "/images/habilitados/lucas passou.webp",
      alt: "Arte da Direção Segura celebrando a aprovação de Lucas ao lado de Luciano",
    },
    {
      src: "/images/habilitados/marcelo passou.webp",
      alt: "Arte da Direção Segura celebrando a aprovação de Marcelo ao lado de Luciano",
    },
    {
      src: "/images/habilitados/paola passou.webp",
      alt: "Arte da Direção Segura celebrando a aprovação de Paola ao lado de Luciano",
    },
  ],
  testimonialVideo: "/images/resultados/DEPOIMENTO REAL.mp4",
} as const satisfies {
  branding: { logo: string; icon: string };
  hero: SiteMediaAsset;
  professionalPortrait: SiteMediaAsset;
  mentorship: SiteMediaAsset;
  licensedTraining: SiteMediaAsset;
  guidesCover: SiteMediaAsset;
  practicalTest: SiteMediaAsset;
  car: SiteMediaAsset;
  carFront: SiteMediaAsset;
  carGallery: readonly SiteMediaAsset[];
  motorcycle: SiteMediaAsset;
  motorcycleGallery: readonly SiteMediaAsset[];
  vehicles: SiteMediaAsset;
  results: readonly SiteMediaAsset[];
  testimonialVideo: string;
};
