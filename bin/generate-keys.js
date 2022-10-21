#!/usr/bin/env deno run --allow-write
import { parse } from "../src/deps.ts";

const flags = parse(Deno.args);
if (!flags.private) {
  console.error("The '--private=OUT_FILE' flag must be provided");
  Deno.exit(1);
}

const { publicKey, privateKey } = await crypto.subtle.generateKey(
  {
    name: "Ed25519",
  },
  true,
  ["sign", "verify"],
);

await Deno.writeTextFile(
  flags.private,
  JSON.stringify(await crypto.subtle.exportKey("jwk", privateKey), null, 2),
);

console.log(
  JSON.stringify(await crypto.subtle.exportKey("jwk", publicKey), null, 2),
);
