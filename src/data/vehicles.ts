import { siteMedia, type SiteMediaAsset } from "@/data/media";

export type VehicleSpecification = {
  label: string;
  value: string;
};

export type TrainingVehicle = {
  id: "car" | "motorcycle";
  category: "A" | "B";
  name: string;
  shortName: string;
  description: string;
  specifications: readonly VehicleSpecification[];
  learningGoals: readonly string[];
  images: readonly SiteMediaAsset[];
  href: string;
  linkLabel: string;
};

export const trainingVehicles: readonly TrainingVehicle[] = [
  {
    id: "car",
    category: "B",
    name: "Fiat Mobi",
    shortName: "Mobi",
    description:
      "Compacto e versátil, facilita a percepção do espaço do veículo durante manobras e apoia uma adaptação progressiva aos controles do carro.",
    specifications: [
      { label: "Ano/modelo", value: "2017/2018" },
      { label: "Motorização", value: "1.0 flex" },
      { label: "Treinamento", value: "Categoria B" },
    ],
    learningGoals: [
      "Familiarização com os controles",
      "Aceleração e frenagem",
      "Manobras e estacionamento",
      "Percepção de espaço e posicionamento",
    ],
    images: siteMedia.carGallery,
    href: "/aulas/carro",
    linkLabel: "Conhecer aulas de carro",
  },
  {
    id: "motorcycle",
    category: "A",
    name: "Yamaha Factor 150",
    shortName: "Factor 150",
    description:
      "Leve e prática para o uso urbano, permite desenvolver domínio dos comandos, equilíbrio e técnicas de pilotagem de forma gradual e consciente.",
    specifications: [
      { label: "Ano/modelo", value: "2021/2022" },
      { label: "Motor", value: "149 cm³ flex" },
      { label: "Transmissão", value: "5 velocidades" },
    ],
    learningGoals: [
      "Postura, equilíbrio e baixa velocidade",
      "Embreagem, acelerador e freios",
      "Troca de marchas",
      "Curvas, manobras e direção defensiva",
    ],
    images: siteMedia.motorcycleGallery,
    href: "/aulas/moto",
    linkLabel: "Conhecer aulas de moto",
  },
] as const;
