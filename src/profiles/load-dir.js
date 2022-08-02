import { join } from "../deps.ts";
import load from "./load.js";

export default async (dir) => {
  const profiles = [];
  for await (const file of Deno.readDir(dir)) {
    if (file.isFile && file.name.endsWith(".json")) {
      profiles.push(await load(join(dir, file.name)));
    }
  }
  return Object.fromEntries(profiles);
};
