import { crypto } from "../deps.ts";
import toEncryptionKey from "../jwk/to-encryption-key.js";
import encrypt from "../jwk/encrypt.js";
import attempt from "../util/attempt.js";
import thumbprint from "../jwk/thumbprint.js";
import { jsonRequired } from "../responses.js";

export default async (request, { store, profiles }) => {
  const [bodyError, body] = await attempt(request.json());
  if (bodyError) return jsonRequired();

  if (!body.publicKey) {
    return new Response('The JSON body must include a "publicKey" key', {
      status: 422,
    });
  }

  const [thumbprintError, kid] = await attempt(thumbprint(body.publicKey));
  if (thumbprintError) {
    return new Response("Could not calculate the public key's thumbprint", {
      status: 400,
    });
  }

  const profile = profiles[kid];
  if (!profile) {
    return new Response("Public key's thumbprint does not match any profiles", {
      status: 400,
    });
  }

  const [keyImportError, publicKey] = await attempt(toEncryptionKey(
    profile.publicKey,
  ));
  if (keyImportError) {
    return new Response("Could not create a useable public key", {
      status: 400,
    });
  }

  const nonce = `nonce-${crypto.randomUUID()}`;
  const secret = `secret-${crypto.randomUUID()}`;
  const [setError] = await attempt(Promise.all([
    store.set(`${nonce}:kid`, kid, { ex: 60 }),
    store.set(`${nonce}:secret`, secret, { ex: 60 }),
  ]));
  if (setError) {
    return new Response("Could not establish nonce session", { status: 500 });
  }

  const [encryptError, challenge] = await attempt(encrypt(publicKey, secret));
  if (encryptError) {
    return new Response("Could not encrypt challenge secret", { status: 500 });
  }

  return new Response(JSON.stringify({ data: { nonce, challenge } }));
};
