import { MessageCircle } from "lucide-react";

import { createWhatsAppUrl, whatsappMessages } from "@/lib/whatsapp";

export function WhatsAppFloat() {
  return (
    <a
      href={createWhatsAppUrl(whatsappMessages.general)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com Luciano pelo WhatsApp"
      className="
        fixed bottom-5 right-5 z-50
        flex h-14 w-14 items-center justify-center
        rounded-full bg-[#25D366]
        text-white shadow-2xl
        transition
        hover:scale-105
      "
    >
      <MessageCircle size={28} />
    </a>
  );
}