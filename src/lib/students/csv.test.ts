import assert from "node:assert/strict";
import test from "node:test";

import { protectSpreadsheetCell } from "./csv";

test("exportação neutraliza fórmulas e escapa aspas", () => {
  assert.equal(protectSpreadsheetCell("=IMPORTXML(...)"), "\"'=IMPORTXML(...)\"");
  assert.equal(protectSpreadsheetCell('Nome "Teste"'), '"Nome ""Teste"""');
});
