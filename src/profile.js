import { thumbprint } from "./jwk.js";

export async function load(path) {
  const profile = JSON.parse(await Deno.readTextFile(path));
  return [await thumbprint(profile.publicKey), profile];
}
