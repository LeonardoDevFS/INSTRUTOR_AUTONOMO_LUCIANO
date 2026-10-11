type RequestOriginInput = {
  origin?: string | null;
  host?: string | null;
  forwardedHost?: string | null;
  forwardedProtocol?: string | null;
  requestOrigin?: string | null;
  configuredOrigins?: Array<string | undefined>;
};

function firstForwardedValue(value?: string | null) {
  return value?.split(",", 1)[0]?.trim();
}

function normalizedOrigin(value?: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.origin
      : null;
  } catch {
    return null;
  }
}

export function isRequestOriginAllowed(input: RequestOriginInput) {
  const requestOrigin = normalizedOrigin(input.origin);
  if (!requestOrigin) return false;

  const allowedOrigins = new Set<string>();
  for (const configured of input.configuredOrigins ?? []) {
    const normalized = normalizedOrigin(configured);
    if (normalized) allowedOrigins.add(normalized);
  }

  const nextOrigin = normalizedOrigin(input.requestOrigin);
  if (nextOrigin) allowedOrigins.add(nextOrigin);

  const host =
    firstForwardedValue(input.forwardedHost) ??
    firstForwardedValue(input.host);
  const protocol =
    firstForwardedValue(input.forwardedProtocol)?.replace(":", "") ??
    (nextOrigin ? new URL(nextOrigin).protocol.replace(":", "") : undefined);
  if (host && (protocol === "http" || protocol === "https")) {
    const proxyOrigin = normalizedOrigin(`${protocol}://${host}`);
    if (proxyOrigin) allowedOrigins.add(proxyOrigin);
  }

  return allowedOrigins.has(requestOrigin);
}
