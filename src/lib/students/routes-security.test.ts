import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const routeFiles = [
  "src/app/api/admin/students/route.ts",
  "src/app/api/admin/students/export/route.ts",
  "src/app/api/admin/students/[studentId]/route.ts",
  "src/app/api/admin/students/[studentId]/records/route.ts",
];

test("todas as rotas de alunos exigem administrador autorizado", () => {
  for (const routeFile of routeFiles) {
    const source = readFileSync(resolve(routeFile), "utf8");
    assert.match(source, /requireAdminApi\(request\)/);
  }
});

test("todas as rotas com escrita validam a origem", () => {
  for (const routeFile of routeFiles) {
    const source = readFileSync(resolve(routeFile), "utf8");
    if (/export async function (POST|PATCH|DELETE)/.test(source)) {
      assert.match(source, /assertSameOrigin\(request\)/);
    }
  }
});

test("rotas não registram corpo da requisição ou dados pessoais em logs", () => {
  for (const routeFile of routeFiles) {
    const source = readFileSync(resolve(routeFile), "utf8");
    assert.equal(/console\.(log|error)\([^\n]*(request|input|student)/i.test(source), false);
  }
});
