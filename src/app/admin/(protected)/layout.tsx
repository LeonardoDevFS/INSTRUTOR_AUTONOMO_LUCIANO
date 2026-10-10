import type { Metadata } from "next";

import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminPage } from "@/lib/auth/require-admin";

export const metadata: Metadata = {
  title: "Painel administrativo",
  robots: { index: false, follow: false, noarchive: true },
};

export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminPage();
  return <AdminShell email={session.user?.email ?? "Administrador"}>{children}</AdminShell>;
}
