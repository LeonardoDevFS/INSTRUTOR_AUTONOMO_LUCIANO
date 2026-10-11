import { createHash, randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { spawn } from "node:child_process";

import { loadEnvConfig } from "@next/env";

const CALLBACK_HOST = "localhost";
const CALLBACK_PORT = 53_682;
const CALLBACK_PATH = "/oauth2/callback";
const REDIRECT_URI = `http://${CALLBACK_HOST}:${CALLBACK_PORT}${CALLBACK_PATH}`;
const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.events";
const AUTHORIZATION_TIMEOUT_MS = 5 * 60 * 1000;

type GoogleTokenPayload = {
  access_token?: string;
  refresh_token?: string;
  scope?: string;
  error?: string;
};

type GoogleUserInfo = {
  email?: string;
  email_verified?: boolean;
};

function requireEnvironment(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} não está definida em .env.local.`);
  return value;
}

function base64Url(value: Buffer) {
  return value.toString("base64url");
}

function openAuthorizationUrl(url: string) {
  const command =
    process.platform === "win32"
      ? { file: "rundll32", args: ["url.dll,FileProtocolHandler", url] }
      : process.platform === "darwin"
        ? { file: "open", args: [url] }
        : { file: "xdg-open", args: [url] };

  try {
    const child = spawn(command.file, command.args, {
      detached: true,
      stdio: "ignore",
      windowsHide: true,
    });
    child.unref();
    return true;
  } catch {
    return false;
  }
}

function callbackPage(title: string, message: string) {
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${title}</title>
    <style>
      body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #070707; color: #f5f5f5; font: 16px/1.5 system-ui, sans-serif; }
      main { width: min(34rem, calc(100% - 2rem)); padding: 2rem; border: 1px solid #5f4a16; border-radius: 1rem; background: #101010; }
      h1 { color: #e5b93f; font-size: 1.5rem; }
    </style>
  </head>
  <body><main><h1>${title}</h1><p>${message}</p></main></body>
</html>`;
}

async function receiveAuthorizationCode(state: string, authorizationUrl: string) {
  let resolveCode: (code: string) => void;
  let rejectCode: (error: Error) => void;
  const codePromise = new Promise<string>((resolvePromise, rejectPromise) => {
    resolveCode = resolvePromise;
    rejectCode = rejectPromise;
  });

  const server = createServer((request, response) => {
    const requestUrl = new URL(request.url ?? "/", REDIRECT_URI);
    if (requestUrl.pathname !== CALLBACK_PATH) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Não encontrado.");
      return;
    }

    const returnedState = requestUrl.searchParams.get("state");
    const oauthError = requestUrl.searchParams.get("error");
    const code = requestUrl.searchParams.get("code");
    const secureHeaders = {
      "Cache-Control": "no-store",
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'",
      "Content-Type": "text/html; charset=utf-8",
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
    };

    if (returnedState !== state) {
      response.writeHead(400, secureHeaders);
      response.end(
        callbackPage(
          "Autorização recusada",
          "O estado de segurança não corresponde. Feche esta janela e execute o comando novamente.",
        ),
      );
      rejectCode(new Error("o state retornado pelo Google não corresponde."));
      return;
    }

    if (oauthError || !code) {
      response.writeHead(400, secureHeaders);
      response.end(
        callbackPage(
          "Autorização não concluída",
          "O Google não retornou uma autorização válida. Você pode fechar esta janela.",
        ),
      );
      rejectCode(
        new Error(
          oauthError
            ? `o Google retornou ${oauthError}.`
            : "o Google não retornou o código de autorização.",
        ),
      );
      return;
    }

    response.writeHead(200, secureHeaders);
    response.end(
      callbackPage(
        "Conta autorizada",
        "Volte ao terminal para confirmar o armazenamento seguro. Nenhum token foi exibido nesta página.",
      ),
    );
    resolveCode(code);
  });

  const timeout = setTimeout(() => {
    rejectCode(new Error("a autorização expirou após cinco minutos."));
  }, AUTHORIZATION_TIMEOUT_MS);

  try {
    await new Promise<void>((resolvePromise, rejectPromise) => {
      server.once("error", rejectPromise);
      server.listen(CALLBACK_PORT, CALLBACK_HOST, resolvePromise);
    });

    console.log(`Callback local aguardando em ${REDIRECT_URI}`);
    if (!openAuthorizationUrl(authorizationUrl)) {
      console.log("Não foi possível abrir o navegador automaticamente.");
    }
    console.log("Se necessário, abra esta URL no navegador:");
    console.log(authorizationUrl);

    return await codePromise;
  } finally {
    clearTimeout(timeout);
    await new Promise<void>((resolvePromise) => {
      server.close(() => resolvePromise());
    });
  }
}

async function exchangeCode(input: {
  code: string;
  codeVerifier: string;
  clientId: string;
  clientSecret: string;
}) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: input.clientId,
      client_secret: input.clientSecret,
      code: input.code,
      code_verifier: input.codeVerifier,
      grant_type: "authorization_code",
      redirect_uri: REDIRECT_URI,
    }),
  });
  const payload = (await response.json()) as GoogleTokenPayload;

  if (!response.ok || !payload.access_token) {
    throw new Error(
      `não foi possível trocar o código por tokens (${payload.error ?? response.status}).`,
    );
  }
  if (!payload.refresh_token) {
    throw new Error(
      "o Google não retornou refresh token. Revogue o acesso anterior do aplicativo na Conta Google e autorize novamente.",
    );
  }
  if (!payload.scope?.split(" ").includes(CALENDAR_SCOPE)) {
    throw new Error("o token retornado não inclui o escopo do Google Agenda.");
  }

  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
  };
}

async function verifyAuthorizedAccount(accessToken: string, expectedEmail: string) {
  const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  const user = (await response.json()) as GoogleUserInfo;
  if (!response.ok || !user.email || user.email_verified !== true) {
    throw new Error("não foi possível confirmar o e-mail da Conta Google.");
  }
  if (user.email.toLowerCase() !== expectedEmail.toLowerCase()) {
    throw new Error(
      `a conta autorizada não corresponde a ADMIN_ALLOWED_EMAIL (${expectedEmail}).`,
    );
  }
  return user.email;
}

async function verifyCalendarAccess(accessToken: string, calendarId: string) {
  const params = new URLSearchParams({
    maxResults: "1",
    singleEvents: "true",
    timeMin: new Date().toISOString(),
  });
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    },
  );
  if (!response.ok) {
    throw new Error(
      `a conta autorizada não conseguiu consultar GOOGLE_CALENDAR_ID (${response.status}).`,
    );
  }
}

function saveRefreshToken(refreshToken: string) {
  const envPath = resolve(process.cwd(), ".env.local");
  const current = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";
  const line = `GOOGLE_CALENDAR_REFRESH_TOKEN=${JSON.stringify(refreshToken)}`;
  const pattern = /^GOOGLE_CALENDAR_REFRESH_TOKEN=.*$/m;
  const next = pattern.test(current)
    ? current.replace(pattern, line)
    : `${current.trimEnd()}${current.trim() ? "\n" : ""}${line}\n`;

  writeFileSync(envPath, next, { encoding: "utf8", mode: 0o600 });
}

async function confirm(question: string, expectedAnswer: string) {
  const terminal = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const answer = await terminal.question(question);
    return answer.trim() === expectedAnswer;
  } finally {
    terminal.close();
  }
}

async function main() {
  loadEnvConfig(process.cwd());

  const clientId = requireEnvironment("AUTH_GOOGLE_ID");
  const clientSecret = requireEnvironment("AUTH_GOOGLE_SECRET");
  const expectedEmail = requireEnvironment("ADMIN_ALLOWED_EMAIL");
  const calendarId = requireEnvironment("GOOGLE_CALENDAR_ID");

  if (process.env.GOOGLE_CALENDAR_REFRESH_TOKEN?.trim()) {
    const continueAuthorization = await confirm(
      "Já existe um refresh token local. Digite SUBSTITUIR para gerar outro: ",
      "SUBSTITUIR",
    );
    if (!continueAuthorization) {
      console.log("Autorização cancelada; o token existente foi preservado.");
      return;
    }
  }

  const state = base64Url(randomBytes(32));
  const codeVerifier = base64Url(randomBytes(64));
  const codeChallenge = base64Url(
    createHash("sha256").update(codeVerifier).digest(),
  );
  const authorizationUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authorizationUrl.search = new URLSearchParams({
    access_type: "offline",
    client_id: clientId,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    include_granted_scopes: "true",
    login_hint: expectedEmail,
    prompt: "consent",
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: `openid email ${CALENDAR_SCOPE}`,
    state,
  }).toString();

  console.log("Iniciando autorização offline do Google Agenda.");
  console.log(`Conta esperada: ${expectedEmail}`);
  const code = await receiveAuthorizationCode(state, authorizationUrl.toString());
  const tokens = await exchangeCode({ code, codeVerifier, clientId, clientSecret });
  const authorizedEmail = await verifyAuthorizedAccount(
    tokens.accessToken,
    expectedEmail,
  );
  await verifyCalendarAccess(tokens.accessToken, calendarId);

  console.log(`Conta e agenda confirmadas para ${authorizedEmail}.`);
  const shouldSave = await confirm(
    "Digite SALVAR para gravar o refresh token somente em .env.local: ",
    "SALVAR",
  );
  if (!shouldSave) {
    console.log("Token descartado e nenhum arquivo foi alterado.");
    return;
  }

  saveRefreshToken(tokens.refreshToken);
  console.log(
    "Refresh token armazenado em .env.local sem ser exibido. CUSTOM_BOOKING_ENABLED continua inalterado.",
  );
}

main().catch((error: unknown) => {
  console.error(
    error instanceof Error
      ? `Falha na autorização do Google: ${error.message}`
      : "Falha desconhecida na autorização do Google.",
  );
  process.exitCode = 1;
});
