import type { ReactNode } from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

type ActionLinkProps = {
  href: string;
  children: ReactNode;
  icon?: ReactNode;
  external?: boolean;
  variant?: "primary" | "secondary" | "text";
  className?: string;
  ariaLabel?: string;
};

const variants = {
  primary:
    "bg-gold text-black shadow-[0_12px_45px_rgba(229,185,63,0.2)] hover:-translate-y-0.5 hover:bg-gold-light",
  secondary:
    "border border-white/15 bg-white/[0.03] text-white hover:-translate-y-0.5 hover:border-gold/50 hover:bg-white/[0.06]",
  text: "px-0 text-gold hover:text-gold-light",
} as const;

export function ActionLink({
  href,
  children,
  icon,
  external = false,
  variant = "primary",
  className,
  ariaLabel,
}: ActionLinkProps) {
  const linkClassName = cn(
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-extrabold transition duration-200",
    variants[variant],
    className,
  );

  const content = (
    <>
      {children}
      {icon}
    </>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ariaLabel}
        className={linkClassName}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} aria-label={ariaLabel} className={linkClassName}>
      {content}
    </Link>
  );
}
