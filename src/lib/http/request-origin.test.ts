import assert from "node:assert/strict";
import test from "node:test";

import { isRequestOriginAllowed } from "./request-origin";

test("aceita a origem externa reconstruída pelos headers do proxy", () => {
  assert.equal(
    isRequestOriginAllowed({
      origin: "https://instrutorautonomoitajuba.com.br",
      forwardedHost: "instrutorautonomoitajuba.com.br, internal.proxy",
      forwardedProtocol: "https, http",
      requestOrigin: "http://internal.local",
    }),
    true,
  );
});

test("aceita o domínio canônico configurado", () => {
  assert.equal(
    isRequestOriginAllowed({
      origin: "https://instrutorautonomoitajuba.com.br",
      configuredOrigins: ["https://instrutorautonomoitajuba.com.br/agendar"],
    }),
    true,
  );
});

test("rejeita origem ausente, inválida ou diferente", () => {
  assert.equal(isRequestOriginAllowed({ origin: null }), false);
  assert.equal(
    isRequestOriginAllowed({
      origin: "https://site-malicioso.example",
      configuredOrigins: ["https://instrutorautonomoitajuba.com.br"],
    }),
    false,
  );
});
