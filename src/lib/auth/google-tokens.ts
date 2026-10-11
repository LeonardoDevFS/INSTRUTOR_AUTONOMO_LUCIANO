import "server-only";

type GoogleTokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
};

type GoogleTokenErrorResponse = {
  error?: string;
};

type GoogleRefreshFailure =
  | "configuration"
  | "expired"
  | "rejected"
  | "unavailable";

type GoogleRefreshResult =
  | { ok: true; payload: GoogleTokenResponse }
  | { ok: false; failure: GoogleRefreshFailure };

export class GoogleOAuthError extends Error {
  constructor(
    public readonly code:
      | "GOOGLE_OAUTH_CONFIGURATION"
      | "GOOGLE_OAUTH_EXPIRED"
      | "GOOGLE_OAUTH_REJECTED"
      | "GOOGLE_OAUTH_UNAVAILABLE",
  ) {
    super("A autorização offline do Google Agenda está indisponível.");
    this.name = "GoogleOAuthError";
  }
}

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

async function requestGoogleAccessToken(
  refreshToken: string,
): Promise<GoogleRefreshResult> {
  const clientId = process.env.AUTH_GOOGLE_ID?.trim();
  const clientSecret = process.env.AUTH_GOOGLE_SECRET?.trim();
  if (!clientId || !clientSecret) {
    return { ok: false, failure: "configuration" };
  }

  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
      cache: "no-store",
    });
    const payload: unknown = await response.json();

    if (response.ok && isGoogleTokenResponse(payload)) {
      return { ok: true, payload };
    }

    const googleError =
      payload && typeof payload === "object"
        ? (payload as GoogleTokenErrorResponse).error
        : undefined;
    if (googleError === "invalid_grant") {
      return { ok: false, failure: "expired" };
    }
    if (googleError === "invalid_client") {
      return { ok: false, failure: "configuration" };
    }
    return {
      ok: false,
      failure: response.status >= 500 || response.status === 429
        ? "unavailable"
        : "rejected",
    };
  } catch {
    return { ok: false, failure: "unavailable" };
  }
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

  const result = await requestGoogleAccessToken(token.refreshToken);
  if (!result.ok) {
    return { ...token, tokenError: "RefreshAccessTokenError" };
  }

  return {
    ...token,
    accessToken: result.payload.access_token,
    accessTokenExpiresAt: Date.now() + result.payload.expires_in * 1000,
    refreshToken: result.payload.refresh_token ?? token.refreshToken,
    tokenError: undefined,
  };
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

export async function getPublicBookingAccessToken() {
  const refreshToken = process.env.GOOGLE_CALENDAR_REFRESH_TOKEN?.trim();
  if (!refreshToken) {
    throw new GoogleOAuthError("GOOGLE_OAUTH_CONFIGURATION");
  }

  const result = await requestGoogleAccessToken(refreshToken);
  if (!result.ok) {
    const code =
      result.failure === "configuration"
        ? "GOOGLE_OAUTH_CONFIGURATION"
        : result.failure === "expired"
          ? "GOOGLE_OAUTH_EXPIRED"
          : result.failure === "rejected"
            ? "GOOGLE_OAUTH_REJECTED"
            : "GOOGLE_OAUTH_UNAVAILABLE";
    throw new GoogleOAuthError(code);
  }

  return result.payload.access_token;
}
