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
} as const;