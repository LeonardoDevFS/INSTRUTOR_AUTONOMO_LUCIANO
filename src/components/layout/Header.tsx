"use client";

import Link from "next/link";
import { CalendarDays, Menu, X } from "lucide-react";
import { useState } from "react";

import { siteConfig } from "@/config/site";
import { mainNavigation } from "@/data/navigation";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [brandLead, ...brandTail] = siteConfig.brand.split(" ");

  return (
    <header
      className="
        fixed left-0 top-0 z-50 w-full
        border-b border-white/10
        bg-black/75 backdrop-blur-xl
      "
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link
          href="/"
          className="group flex flex-col leading-none"
          onClick={() => setMenuOpen(false)}
        >
          <span className="font-display text-xl font-extrabold tracking-[0.08em] text-white">
            {brandLead}
            <span className="text-gold"> {brandTail.join(" ")}</span>
          </span>

          <span className="mt-1 text-[10px] uppercase tracking-[0.28em] text-white/55">
            {siteConfig.name}
          </span>
        </Link>

        <nav
          aria-label="Navegação principal"
          className="hidden items-center gap-8 lg:flex"
        >
          {mainNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="
                text-sm font-semibold text-white/70
                transition-colors hover:text-gold
              "
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Link
            href="/agendar"
            className="
              inline-flex items-center gap-2
              rounded-full bg-gold px-6 py-3
              text-sm font-extrabold text-black
              transition
              hover:-translate-y-0.5 hover:bg-gold-light
            "
          >
            <CalendarDays size={18} />

            Agendar aula
          </Link>
        </div>

        <button
          type="button"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-controls="mobile-navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((current) => !current)}
          className="
            flex h-11 w-11 items-center justify-center
            rounded-full border border-white/10 text-white
            lg:hidden
          "
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </div>

      <div
        id="mobile-navigation"
        hidden={!menuOpen}
        className="border-t border-white/10 bg-black lg:hidden"
      >
        <nav aria-label="Navegação mobile" className="flex flex-col p-5">
          {mainNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="
                border-b border-white/5 py-4
                font-semibold text-white/75
              "
            >
              {item.label}
            </Link>
          ))}

          <Link
            href="/agendar"
            onClick={() => setMenuOpen(false)}
            className="
              mt-5 flex items-center justify-center gap-2
              rounded-full bg-gold px-6 py-4
              font-extrabold text-black
            "
          >
            <CalendarDays size={19} />

            Agendar minha aula
          </Link>
        </nav>
      </div>
    </header>
  );
}
