import { assertEquals } from "../deps.ts";
import floorHundred from "../util/floor-hundred.js";
import startChallenge from "./start-challenge.js";
import * as InMemoryStore from "../store/in-memory.js";
import load from "../profiles/load.js";

const profiles = Object.fromEntries([
  await load("./test/profiles/example.json"),
]);

Deno.test("empty body", async () => {
  const { status } = await startChallenge(
    new Request("http://localhost/_/start-challenge"),
    { profiles, store: InMemoryStore.create() },
  )
  assertEquals(floorHundred(status), 400)
});
