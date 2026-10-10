import { LogOut } from "lucide-react";
import Image from "next/image";

import { signOut } from "@/auth";
import { AdminNav } from "@/components/admin/AdminNav";
import { siteConfig } from "@/config/site";
import { siteMedia } from "@/data/media";

export function AdminShell({
  children,
  email,
}: {
  children: React.ReactNode;
  email: string;
}) {
  return (
    <div className="min-h-screen bg-[#070707] text-white">
      <div className="mx-auto flex min-h-screen max-w-[1680px]">
        <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-white/10 bg-[#0b0b0b] p-6 lg:flex lg:flex-col">
          <div className="flex items-center gap-3">
            <Image
              src={siteMedia.branding.logo}
              alt={`Logo ${siteConfig.brand}`}
              width={156}
              height={72}
              className="h-14 w-auto object-contain"
              priority
            />
          </div>
          <p className="mt-5 text-[0.65rem] font-extrabold uppercase tracking-[0.28em] text-gold">
            Painel administrativo
          </p>
          <AdminNav />
          <div className="border-t border-white/10 pt-5">
            <p className="truncate text-xs text-white/40" title={email}>
              {email}
            </p>
            <form
              className="mt-3"
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/admin/login" });
              }}
            >
              <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-white/60 transition hover:bg-white/[0.06] hover:text-white">
                <LogOut size={17} aria-hidden="true" />
                Sair
              </button>
            </form>
          </div>
        </aside>

        <div className="min-w-0 flex-1 pb-28 lg:pb-0">
          <header className="flex min-h-20 items-center justify-between border-b border-white/10 px-5 sm:px-8 lg:hidden">
            <Image
              src={siteMedia.branding.logo}
              alt={`Logo ${siteConfig.brand}`}
              width={130}
              height={60}
              className="h-12 w-auto object-contain"
              priority
            />
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/admin/login" });
              }}
            >
              <button
                aria-label="Sair do painel"
                className="grid size-11 place-items-center rounded-full border border-white/10 text-white/60"
              >
                <LogOut size={18} aria-hidden="true" />
              </button>
            </form>
          </header>
          <main id="conteudo-admin" className="px-4 py-7 sm:px-8 sm:py-10 xl:px-12">
            {children}
          </main>
        </div>
      </div>

      <div className="fixed inset-x-3 bottom-3 z-40 rounded-2xl border border-white/10 bg-[#101010]/95 p-2 shadow-2xl shadow-black/50 backdrop-blur lg:hidden">
        <AdminNav mobile />
      </div>
    </div>
  );
}
