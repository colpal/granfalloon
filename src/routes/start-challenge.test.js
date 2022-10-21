import { assertEquals } from "../deps.ts";
import floorHundred from "../util/floor-hundred.js";
import startChallenge from "./start-challenge.js";
import * as InMemoryStore from "../store/in-memory.js";
import load from "../profiles/load.js";

const [rsaKid, rsaProfile] = await load("./test/profiles/example-rsa.json");
const profiles = Object.fromEntries([[rsaKid, rsaProfile]]);
const url = "http://localhost/_/start-challenge";
const log = { info: (x) => x, error: (x) => x };

Deno.test("empty body", async () => {
  const { status } = await startChallenge(
    new Request(url),
    { log, profiles, store: InMemoryStore.create() },
  );
  assertEquals(floorHundred(status), 400);
});

Deno.test("empty JSON", async () => {
  const { status } = await startChallenge(
    new Request(url, { method: "POST", body: "{}" }),
    { log, profiles, store: InMemoryStore.create() },
  );
  assertEquals(floorHundred(status), 400);
});

Deno.test("empty public key", async () => {
  const { status } = await startChallenge(
    new Request(url, {
      method: "POST",
      body: JSON.stringify({ publicKey: {} }),
    }),
    { log, profiles, store: InMemoryStore.create() },
  );
  assertEquals(floorHundred(status), 400);
});

Deno.test("unknown public key", async () => {
  const { status } = await startChallenge(
    new Request(url, {
      method: "POST",
      body: JSON.stringify({ publicKey: rsaProfile.publicKey }),
    }),
    { log, profiles: {}, store: InMemoryStore.create() },
  );
  assertEquals(floorHundred(status), 400);
});

Deno.test("store error", async () => {
  const { status } = await startChallenge(
    new Request(url, {
      method: "POST",
      body: JSON.stringify({ publicKey: rsaProfile.publicKey }),
    }),
    {
      log,
      profiles,
      store: {
        // deno-lint-ignore require-await
        async set() {
          throw new Error();
        },
      },
    },
  );
  assertEquals(floorHundred(status), 500);
});
