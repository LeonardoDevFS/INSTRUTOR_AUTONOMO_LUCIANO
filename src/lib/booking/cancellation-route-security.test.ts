import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const route = readFileSync(
  resolve("src/app/api/booking/cancellations/route.ts"),
  "utf8",
);
const page = readFileSync(
  resolve("src/components/booking/CancelBooking.tsx"),
  "utf8",
);

test("cancelamento público valida origem, limita tentativas e usa hash", () => {
  assert.match(route, /assertSameOrigin\(request\)/);
  assert.match(route, /rateLimitBooking\(requestIp\(request\), "cancellation", 10\)/);
  assert.match(route, /hashCancellationToken\(input\.token\)/);
  assert.doesNotMatch(route, /console\.(?:log|error)\([^\n]*input\.token/);
  assert.match(route, /SITE_BOOKING_REQUEST_KEY/);
  assert.match(route, /!==\s*booking\.id/);
  assert.match(route, /deleteGoogleSiteBooking\(accessToken, eventId, event\.etag\)/);
});

test("token permanece no fragmento e não é enviado por query string", () => {
  assert.match(page, /window\.location\.hash/);
  assert.doesNotMatch(page, /searchParams\.get\("token"\)/);
  assert.doesNotMatch(page, /\?token=/);
});
