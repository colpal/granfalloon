#!/usr/bin/env deno run --allow-net --allow-read
import { serve } from "./deps.ts";
import load from "./profiles/load.js";
import * as InMemoryStore from "./store/in-memory.js";
import router from "./router.js";

serve(router({
  store: InMemoryStore.create(),
  profiles: Object.fromEntries(await Promise.all(Deno.args.map(load))),
  target: "https://jsonplaceholder.typicode.com",
  token: Deno.env.get("GRANFALLOON_TOKEN"),
}));
