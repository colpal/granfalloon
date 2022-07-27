import thumbprint from "../jwk/thumbprint.js";

export default async function load(path) {
  const profile = JSON.parse(await Deno.readTextFile(path));
  return [await thumbprint(profile.publicKey), profile];
}
