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
        fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-50
        flex h-12 w-12 items-center justify-center sm:bottom-5 sm:right-5 sm:h-14 sm:w-14
        rounded-full bg-[#25D366]
        text-white shadow-2xl
        transition
        hover:scale-105
      "
    >
      <MessageCircle size={26} aria-hidden="true" />
    </a>
  );
}
