import type { Metadata } from "next";
import { LockKeyhole } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth, signIn } from "@/auth";
import { siteConfig } from "@/config/site";
import { siteMedia } from "@/data/media";
import { isAdminAuthConfigured, isAllowedAdminEmail } from "@/lib/auth/admin";

export const metadata: Metadata = {
  title: "Acesso administrativo",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const authConfigured = isAdminAuthConfigured();
  const session = authConfigured ? await auth() : null;
  if (isAllowedAdminEmail(session?.user?.email)) redirect("/admin");
  const { error } = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_50%_0%,rgba(229,185,63,0.13),transparent_34%),#070707] px-4 py-10">
      <section className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#0d0d0d] p-7 text-center shadow-2xl shadow-black/60 sm:p-10">
        <Image src={siteMedia.branding.logo} alt={`Logo ${siteConfig.brand}`} width={220} height={102} className="mx-auto h-24 w-auto object-contain" priority />
        <div className="mx-auto mt-7 grid size-12 place-items-center rounded-full border border-gold/30 bg-gold/10 text-gold">
          <LockKeyhole size={21} aria-hidden="true" />
        </div>
        <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.26em] text-gold">Área exclusiva</p>
        <h1 className="mt-3 font-display text-4xl font-extrabold uppercase">Painel administrativo</h1>
        <p className="mt-4 text-sm leading-6 text-white/50">Entre com a conta Google autorizada para consultar e bloquear horários.</p>
        {(!authConfigured || error) && (
          <p role="alert" className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">
            {!authConfigured
              ? "O acesso administrativo ainda precisa das variáveis de autenticação descritas em ADMIN_SETUP.md."
              : "A conta utilizada não está autorizada ou a conexão foi recusada."}
          </p>
        )}
        {authConfigured && (
          <form
            className="mt-7"
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/admin" });
            }}
          >
            <button className="flex min-h-13 w-full items-center justify-center rounded-full bg-gold px-6 text-sm font-extrabold text-black transition hover:bg-gold-light">
              Entrar com Google
            </button>
          </form>
        )}
        <Link href="/" className="mt-6 inline-block text-sm font-bold text-white/45 hover:text-white">Voltar ao site</Link>
      </section>
    </main>
  );
}
