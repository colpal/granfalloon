import { assertNotEquals } from "../deps.ts"
import startChallenge from "./start-challenge.js";
import * as InMemoryStore from "../store/in-memory.js";
import load from "../profiles/load.js";

const profilePath = "./test/profiles/example.json";

Deno.test("empty body", async () => {
  const store = InMemoryStore.create();
  const profiles = Object.fromEntries([await load(profilePath)]);
  const request = new Request("http://localhost");
  const { status } = await startChallenge(request, { store, profiles });
  assertNotEquals(status, 200);
});
