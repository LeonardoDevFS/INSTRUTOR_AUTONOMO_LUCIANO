import { siteConfig } from "@/config/site";

export function createWhatsAppUrl(message?: string) {
  const baseUrl = `https://wa.me/${siteConfig.contact.phoneE164}`;

  if (!message) {
    return baseUrl;
  }

  return `${baseUrl}?text=${encodeURIComponent(message)}`;
}

export const whatsappMessages = {
  general:
    "Olá, Luciano! Encontrei seu site e gostaria de saber mais sobre as aulas.",

  car:
    "Olá, Luciano! Gostaria de saber mais sobre as aulas de carro.",

  motorcycle:
    "Olá, Luciano! Gostaria de saber mais sobre as aulas de moto.",

  mentorship:
    "Olá, Luciano! Gostaria de conversar sobre a mentoria teórica.",

  addition:
    "Olá, Luciano! Já possuo CNH e gostaria de saber mais sobre adição de categoria.",

  licensed:
    "Olá, Luciano! Já tenho CNH, mas gostaria de fazer um treinamento para voltar a dirigir com mais segurança.",

  booking:
    "Olá, Luciano! Gostaria de verificar um horário disponível para aula.",

  cnhGuidance:
    "Olá, Luciano! Preciso de orientação sobre etapas, exames, taxas ou documentação da minha CNH.",

  pcdGuidance:
    "Olá, Luciano! Estou buscando orientações sobre a primeira habilitação para pessoa com deficiência. Gostaria de conversar sobre minhas necessidades e verificar a possibilidade de realizar aulas com um veículo adequado ou adaptado.",
} as const;
