#!/usr/bin/env deno run --allow-net --allow-read
import { serve } from "./deps.ts";
import load from "./profiles/load.js";
import * as InMemoryStore from "./store/in-memory.js";
import router from "./router.js";

const target = "https://jsonplaceholder.typicode.com";

const profiles = Object.fromEntries(
  await Promise.all(Deno.args.map(load)),
);

const store = InMemoryStore.create();

serve(router({ store, profiles, target }));
