import { assertEquals } from "../deps.ts";
import floorHundred from "../util/floor-hundred.js";
import startChallenge from "./start-challenge.js";
import * as InMemoryStore from "../store/in-memory.js";
import load from "../profiles/load.js";

const [kid, profile] = await load("./test/profiles/example.json");
const profiles = Object.fromEntries([[kid, profile]]);
const url = "http://localhost/_/start-challenge";

Deno.test("empty body", async () => {
  const { status } = await startChallenge(
    new Request(url),
    { profiles, store: InMemoryStore.create() },
  );
  assertEquals(floorHundred(status), 400);
});

Deno.test("empty JSON", async () => {
  const { status } = await startChallenge(
    new Request(url, { method: "POST", body: "{}" }),
    { profiles, store: InMemoryStore.create() },
  )
  assertEquals(floorHundred(status), 400);
});

Deno.test("empty public key", async () => {
  const { status } = await startChallenge(
    new Request(url, {
      method: "POST",
      body: JSON.stringify({ publicKey: {} })
    }),
    { profiles, store: InMemoryStore.create() }
  );
  assertEquals(floorHundred(status), 400);
});

Deno.test("unknown public key", async () => {
  const { status } = await startChallenge(
    new Request(url, {
      method: "POST",
      body: JSON.stringify({ publicKey: profile.publicKey }),
    }),
    { profiles: {}, store: InMemoryStore.create() },
  );
  assertEquals(floorHundred(status), 400);
});
