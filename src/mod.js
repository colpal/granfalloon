#!/usr/bin/env deno run --allow-net --allow-read --allow-env
import { connect, serve } from "./deps.ts";
import loadDir from "./profiles/load-dir.js";
import * as InMemoryStore from "./store/in-memory.js";
import router from "./router.js";
import { error, info } from "./log.js";
import parseFlags from "./flags.js";

const flags = await parseFlags(Deno.args);
const token = Deno.env.get("GRANFALLOON_TOKEN");
if (!token) {
  throw new Error("The 'GRANFALLOON_TOKEN' environment variable is required");
}

const store = await {
  "in-memory": InMemoryStore.create,
  "redis": () =>
    connect({ hostname: flags["redis-hostname"], port: flags["redis-port"] }),
}[flags.store]();

const profiles = await loadDir(flags["profile-dir"]);
Deno.addSignalListener("SIGHUP", async () => {
  log.error("[SIGHUP] reloading profiles...");
  Object.assign(profiles, await loadDir(flags["profile-dir"]));
  log.error("[SIGHUP] profiles reloaded");
});

serve(
  router({
    profiles,
    store,
    token,
    log: { info, error },
    remote: flags.remote,
  }),
  { port: flags.port },
);
