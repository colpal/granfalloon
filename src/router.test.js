import { assertEquals } from "./deps.ts";
import toDecryptionKey from "./jwk/to-decryption-key.js";
import decrypt from "./jwk/decrypt.js";
import * as InMemoryStore from "./store/in-memory.js";
import load from "./profiles/load.js";
import Router from "./router.js";

Deno.test({
  name: "full flow",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const [kid, profile] = await load("./test/profiles/example.json");
    const router = Router({
      store: InMemoryStore.create(),
      target: "https://jsonplaceholder.typicode.com",
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
    const passThrough = await router(
      new Request("http://localhost/todos/1", {
        headers: { Authorization: `token ${session}` },
      }),
    );

    assertEquals(
      await passThrough.json(),
      { userId: 1, id: 1, title: "delectus aut autem", completed: false },
    );
  },
});
