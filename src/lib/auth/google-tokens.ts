import "server-only";

type GoogleTokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
};

export type GoogleTokenState = {
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpiresAt?: number;
  tokenError?: "RefreshAccessTokenError";
};

function isGoogleTokenResponse(value: unknown): value is GoogleTokenResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.access_token === "string" &&
    typeof candidate.expires_in === "number"
  );
}

export async function refreshGoogleAccessToken(
  token: GoogleTokenState,
): Promise<GoogleTokenState> {
  if (
    !token.refreshToken ||
    !process.env.AUTH_GOOGLE_ID ||
    !process.env.AUTH_GOOGLE_SECRET
  ) {
    return { ...token, tokenError: "RefreshAccessTokenError" };
  }

  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.AUTH_GOOGLE_ID,
        client_secret: process.env.AUTH_GOOGLE_SECRET,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      }),
      cache: "no-store",
    });

    const payload: unknown = await response.json();

    if (!response.ok || !isGoogleTokenResponse(payload)) {
      return { ...token, tokenError: "RefreshAccessTokenError" };
    }

    return {
      ...token,
      accessToken: payload.access_token,
      accessTokenExpiresAt: Date.now() + payload.expires_in * 1000,
      refreshToken: payload.refresh_token ?? token.refreshToken,
      tokenError: undefined,
    };
  } catch {
    return { ...token, tokenError: "RefreshAccessTokenError" };
  }
}

export async function resolveGoogleAccessToken(token: GoogleTokenState) {
  const stillValid =
    token.accessToken &&
    token.accessTokenExpiresAt &&
    Date.now() < token.accessTokenExpiresAt - 60_000;

  if (stillValid) {
    return token;
  }

  return refreshGoogleAccessToken(token);
}
