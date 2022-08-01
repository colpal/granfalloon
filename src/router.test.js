import { assertEquals } from "./deps.ts";
import toDecryptionKey from "./jwk/to-decryption-key.js";
import decrypt from "./jwk/decrypt.js";
import * as InMemoryStore from "./store/in-memory.js";
import load from "./profiles/load.js";
import Router from "./router.js";

Deno.test({
  name: "end-to-end",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const target = "https://api.github.com";
    const pathname = "user";
    const token = Deno.env.get("GRANFALLOON_TOKEN");
    const log = { info: (x) => x, error: (x) => x };

    const [kid, profile] = await load("./test/profiles/example.json");
    const router = Router({
      log,
      target,
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
      .readTextFile("./test/profiles/example.json.private")
      .then(JSON.parse)
      .then(toDecryptionKey)
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

    const expected = await fetch(`${target}/${pathname}`, {
      headers: {
        Authorization: `token ${token}`,
      },
    });

    assertEquals(await actual.json(), await expected.json());
  },
});
