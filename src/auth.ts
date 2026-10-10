import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

import { isAllowedAdminEmail } from "@/lib/auth/admin";
import { refreshGoogleAccessToken } from "@/lib/auth/google-tokens";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  providers: [
    Google({
      authorization: {
        params: {
          access_type: "offline",
          prompt: "consent",
          scope: [
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/calendar.events",
          ].join(" "),
        },
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  callbacks: {
    async signIn({ profile }) {
      return profile?.email_verified === true && isAllowedAdminEmail(profile.email);
    },
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token ?? token.refreshToken;
        token.accessTokenExpiresAt = account.expires_at
          ? account.expires_at * 1000
          : Date.now() + 55 * 60 * 1000;
        token.tokenError = undefined;
        return token;
      }

      if (
        token.accessToken &&
        token.accessTokenExpiresAt &&
        Date.now() < token.accessTokenExpiresAt - 60_000
      ) {
        return token;
      }

      return refreshGoogleAccessToken(token);
    },
    session({ session, token }) {
      session.authError = token.tokenError;
      return session;
    },
  },
});
