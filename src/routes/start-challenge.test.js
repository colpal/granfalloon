import { assertEquals } from "../deps.ts";
import floorHundred from "../util/floor-hundred.js";
import startChallenge from "./start-challenge.js";
import * as InMemoryStore from "../store/in-memory.js";
import load from "../profiles/load.js";

const [rsaKid, rsaProfile] = await load("./test/profiles/example-rsa.json");
const [ed25519Kid, ed25519Profile] = await load ("./test/profiles/example-ed25519.json");
const profiles = Object.fromEntries([
  [rsaKid, rsaProfile],
  [ed25519Kid, ed25519Profile],
]);
const url = "http://localhost/_/start-challenge";
const log = { info: (x) => x, error: (x) => x };

const unknownPublicKey = (publicKey) => async () => {
  const { status } = await startChallenge(
    new Request(url, {
      method: "POST",
      body: JSON.stringify({ publicKey }),
    }),
    { log, profiles: {}, store: InMemoryStore.create() },
  );
  assertEquals(floorHundred(status), 400);
};

const storeError = (publicKey) => async () => {
  const { status } = await startChallenge(
    new Request(url, {
      method: "POST",
      body: JSON.stringify({ publicKey }),
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
};

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

Deno.test("RSA: unknown public key", unknownPublicKey(rsaProfile.publicKey));
Deno.test("Ed25519: unknown public key", unknownPublicKey(ed25519Profile.publicKey));

Deno.test("RSA: store error", storeError(rsaProfile.publicKey));
Deno.test("Ed25519: store error", storeError(ed25519Profile.publicKey));
