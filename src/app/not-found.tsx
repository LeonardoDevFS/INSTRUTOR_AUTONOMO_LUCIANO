import { ArrowLeft, MessageCircle } from "lucide-react";
import Link from "next/link";

import { siteConfig } from "@/config/site";
import { createWhatsAppUrl, whatsappMessages } from "@/lib/whatsapp";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-16 text-center">
      <div className="max-w-2xl">
        <p className="font-display text-8xl font-extrabold text-gold/20 sm:text-9xl">
          404
        </p>
        <h1 className="-mt-4 font-display text-5xl font-extrabold uppercase leading-none text-white sm:text-6xl">
          Esse caminho não foi encontrado.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-white/50">
          Volte ao início da {siteConfig.brand} ou fale diretamente com Luciano
          para encontrar o que procura.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-extrabold text-black"
          >
            <ArrowLeft size={17} aria-hidden="true" />
            Voltar ao início
          </Link>
          <a
            href={createWhatsAppUrl(whatsappMessages.general)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-bold text-white"
          >
            <MessageCircle size={17} aria-hidden="true" />
            Falar no WhatsApp
          </a>
        </div>
      </div>
    </main>
  );
}
