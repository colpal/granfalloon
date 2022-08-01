import { crypto } from "../deps.ts";
import toEncryptionKey from "../jwk/to-encryption-key.js";
import encrypt from "../jwk/encrypt.js";
import attempt from "../util/attempt.js";
import thumbprint from "../jwk/thumbprint.js";
import {
  cannotCreateNonceSession,
  cannotEncryptChallenge,
  cannotThumbprint,
  invalidPublicKey,
  jsonRequired,
  jsonRequiredKeys,
  unknownPublicKey,
} from "../responses.js";

export default async (request, { store, profiles }) => {
  const [bodyError, body] = await attempt(request.json());
  if (bodyError) return jsonRequired();
  if (!body.publicKey) return jsonRequiredKeys("publicKey");

  const [thumbprintError, kid] = await attempt(thumbprint(body.publicKey));
  if (thumbprintError) return cannotThumbprint(body.publicKey);

  const profile = profiles[kid];
  if (!profile) return unknownPublicKey(body.publicKey);

  const [keyImportError, publicKey] = await attempt(toEncryptionKey(
    profile.publicKey,
  ));
  if (keyImportError) return invalidPublicKey(profile.publicKey);

  const nonce = `nonce-${crypto.randomUUID()}`;
  const secret = `secret-${crypto.randomUUID()}`;
  const [setError] = await attempt(Promise.all([
    store.set(`${nonce}:kid`, kid, { ex: 60 }),
    store.set(`${nonce}:secret`, secret, { ex: 60 }),
  ]));
  if (setError) return cannotCreateNonceSession(profile.publicKey);

  const [encryptError, challenge] = await attempt(encrypt(publicKey, secret));
  if (encryptError) return cannotEncryptChallenge(profile.publicKey);

  return new Response(JSON.stringify({ data: { nonce, challenge } }));
};
