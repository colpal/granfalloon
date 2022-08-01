#!/usr/bin/env deno run --allow-net --allow-read --allow-env
import { serve } from "./deps.ts";
import load from "./profiles/load.js";
import * as InMemoryStore from "./store/in-memory.js";
import router from "./router.js";
import * as log from "./log.js";

serve(router({
  log,
  store: InMemoryStore.create(),
  profiles: Object.fromEntries(await Promise.all(Deno.args.map(load))),
  target: "https://jsonplaceholder.typicode.com",
  token: Deno.env.get("GRANFALLOON_TOKEN"),
}));
