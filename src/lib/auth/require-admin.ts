import "server-only";

import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { isAdminAuthConfigured, isAllowedAdminEmail } from "@/lib/auth/admin";
import { resolveGoogleAccessToken } from "@/lib/auth/google-tokens";
import { isRequestOriginAllowed } from "@/lib/http/request-origin";

export class AdminAuthError extends Error {
  constructor(
    message: string,
    public readonly status: 401 | 403,
    public readonly code: string,
  ) {
    super(message);
    this.name = "AdminAuthError";
  }
}

export async function requireAdminPage() {
  if (!isAdminAuthConfigured()) {
    redirect("/admin/login?error=Configuration");
  }
  const session = await auth();
  if (!session?.user?.email || !isAllowedAdminEmail(session.user.email)) {
    redirect("/admin/login");
  }
  return session;
}

export async function requireAdminApi(request: NextRequest) {
  if (!process.env.AUTH_SECRET) {
    throw new AdminAuthError(
      "A autenticação administrativa ainda não foi configurada.",
      401,
      "AUTH_NOT_CONFIGURED",
    );
  }

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });

  if (!token?.email) {
    throw new AdminAuthError("Faça login novamente.", 401, "UNAUTHENTICATED");
  }
  if (!isAllowedAdminEmail(token.email)) {
    throw new AdminAuthError("Acesso não autorizado.", 403, "FORBIDDEN");
  }

  const refreshed = await resolveGoogleAccessToken(token);
  if (!refreshed.accessToken || refreshed.tokenError) {
    throw new AdminAuthError(
      "A conexão com o Google expirou. Saia e entre novamente.",
      401,
      "GOOGLE_REAUTH_REQUIRED",
    );
  }

  return { email: token.email, accessToken: refreshed.accessToken };
}

export function assertSameOrigin(request: NextRequest) {
  if (
    !isRequestOriginAllowed({
      origin: request.headers.get("origin"),
      host: request.headers.get("host"),
      forwardedHost: request.headers.get("x-forwarded-host"),
      forwardedProtocol: request.headers.get("x-forwarded-proto"),
      requestOrigin: request.nextUrl.origin,
      configuredOrigins: [
        process.env.NEXT_PUBLIC_SITE_URL,
        process.env.URL,
        process.env.DEPLOY_PRIME_URL,
        process.env.DEPLOY_URL,
      ],
    })
  ) {
    throw new AdminAuthError("Origem da requisição inválida.", 403, "INVALID_ORIGIN");
  }
}
