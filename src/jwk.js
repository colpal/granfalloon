import { crypto, encode } from "./deps.ts";

const requiredKeys = {
  RSA: ["e", "kty", "n"],
};

export async function thumbprint(jwk) {
  const ks = requiredKeys[jwk.kty];
  if (!ks) throw new Error(`Unsupported kty: "${jwk.kty}"`);
  const entries = ks.map((k) => [k, jwk[k]]);
  const object = Object.fromEntries(entries);
  const json = JSON.stringify(object);
  const buffer = new TextEncoder().encode(json);
  const bufferHash = await crypto.subtle.digest("SHA-256", buffer);
  return encode(bufferHash);
}
