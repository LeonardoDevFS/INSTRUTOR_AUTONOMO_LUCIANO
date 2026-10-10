"use client";

import { CalendarDays, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin", label: "Visão geral", icon: LayoutDashboard },
  { href: "/admin/agenda", label: "Agenda", icon: CalendarDays },
] as const;

export function AdminNav({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegação administrativa"
      className={
        mobile
          ? "grid grid-cols-2 gap-2"
          : "mt-8 flex flex-1 flex-col gap-2"
      }
    >
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-12 items-center justify-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-colors lg:justify-start ${
              active
                ? "bg-gold text-black"
                : "text-white/55 hover:bg-white/[0.06] hover:text-white"
            }`}
          >
            <Icon size={19} aria-hidden="true" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
