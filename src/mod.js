#!/usr/bin/env deno run --allow-net --allow-read --allow-env
import { serve } from "./deps.ts";
import loadDir from "./profiles/load-dir.js";
import * as InMemoryStore from "./store/in-memory.js";
import router from "./router.js";
import * as log from "./log.js";
import parseFlags from "./flags.js";

const { target, profileDir } = await parseFlags(Deno.args);

serve(router({
  log,
  target,
  store: InMemoryStore.create(),
  profiles: await loadDir(profileDir),
  token: Deno.env.get("GRANFALLOON_TOKEN"),
}));
