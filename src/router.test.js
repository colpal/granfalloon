import { assertEquals } from "./deps.ts";
import toPrivateKey from "./crypto/to-private-key.js";
import decrypt from "./crypto/decrypt.js";
import * as InMemoryStore from "./store/in-memory.js";
import load from "./profiles/load.js";
import Router from "./router.js";

const endToEnd = (profilePath, privatePath) => async() => {
  const remote = "https://api.github.com";
  const pathname = "user";
  const token = Deno.env.get("GRANFALLOON_TOKEN");
  const log = { info: (x) => x, error: (x) => x };

  const [kid, profile] = await load(profilePath);
  const router = Router({
    log,
    remote,
    token,
    store: InMemoryStore.create(),
    profiles: Object.fromEntries([[kid, profile]]),
  });

  const start = await router(
    new Request("http://localhost/_/start-challenge", {
      method: "POST",
      body: JSON.stringify({ publicKey: profile.publicKey }),
    }),
  );

  const { data: { nonce, challenge } } = await start.json();
  const answer = await Deno
    .readTextFile(privatePath)
    .then(JSON.parse)
    .then(toPrivateKey)
    .then((key) => decrypt(key, challenge));
  const complete = await router(
    new Request("http://localhost/_/complete-challenge", {
      method: "POST",
      body: JSON.stringify({ nonce, answer }),
    }),
  );

  const { data: { session } } = await complete.json();
  const actual = await router(
    new Request(`http://localhost/${pathname}`, {
      headers: { Authorization: `token ${session}` },
    }),
  );

  const expected = await fetch(`${remote}/${pathname}`, {
    headers: {
      Authorization: `token ${token}`,
    },
  });

  assertEquals(await actual.json(), await expected.json());
}

Deno.test({
  name: "RSA",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: endToEnd(
    "./test/profiles/example-rsa.json",
    "./test/profiles/example-rsa.json.private",
  ),
});

Deno.test({
  name: "Ed25519",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: endToEnd(
    "./test/profiles/example-ed25519.json",
    "./test/profiles/example-ed25519.json.private",
  ),
});
