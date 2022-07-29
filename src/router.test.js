import { assertEquals } from "./deps.ts";
import * as InMemoryStore from "./store/in-memory.js";
import load from "./profiles/load.js";
import Router from "./router.js";

Deno.test("full flow", async () => {
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
  assertEquals(start.status, 200);
});
