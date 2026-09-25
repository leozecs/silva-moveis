import test from "node:test";
import assert from "node:assert/strict";
import { cartFailurePolicy, SerialQueue } from "../src/lib/cart-lifecycle.ts";

test("503, 429 e falhas de rede preservam carrinho; sessão inválida isola dados", () => {
  for (const status of [0, 400, 409, 429, 500, 502, 503, 504]) assert.equal(cartFailurePolicy(status), "preserve");
  for (const status of [401, 403]) assert.equal(cartFailurePolicy(status), "isolate");
  assert.equal(cartFailurePolicy(404), "retire");
  assert.equal(cartFailurePolicy(409, "cart_completed"), "retire");
});
test("mutações aguardam conclusão anterior mesmo quando uma falha", async () => {
  const queue = new SerialQueue();
  const events = [];
  let release;
  const barrier = new Promise(resolve => { release = resolve; });
  const a = queue.run(async () => { events.push("a-start"); await barrier; events.push("a-end"); throw new Error("unavailable"); });
  const b = queue.run(async () => { events.push("b"); return 2; });
  await Promise.resolve();
  assert.deepEqual(events, ["a-start"]);
  release();
  await assert.rejects(a);
  assert.equal(await b, 2);
  assert.deepEqual(events, ["a-start", "a-end", "b"]);
});
