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
  carGallery,
  motorcycleGallery,
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
} as const;
