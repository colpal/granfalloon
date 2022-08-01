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
  issueChallenge,
  jsonRequired,
  jsonRequiredKeys,
  unknownPublicKey,
} from "../responses.js";
import * as log from "../log.js";

export default async (request, { store, profiles }) => {
  const [bodyError, body] = await attempt(request.json());
  if (bodyError) {
    log.error(bodyError);
    return new Response(log.info(jsonRequired()), { status: 400 });
  }
  if (!body.publicKey) {
    return new Response(
      log.info(jsonRequiredKeys("publicKey")),
      { status: 400 },
    );
  }

  const [thumbprintError, kid] = await attempt(thumbprint(body.publicKey));
  if (thumbprintError) {
    log.error(thumbprintError);
    return new Response(
      log.info(cannotThumbprint(body.publicKey)),
      { status: 400 },
    );
  }

  const profile = profiles[kid];
  if (!profile) {
    return new Response(
      log.info(unknownPublicKey(body.publicKey)),
      { status: 400 },
    );
  }

  const [keyImportError, publicKey] = await attempt(toEncryptionKey(
    profile.publicKey,
  ));
  if (keyImportError) {
    log.error(keyImportError);
    return new Response(
      log.info(invalidPublicKey(profile.publicKey)),
      { status: 400 },
    );
  }

  const nonce = `nonce-${crypto.randomUUID()}`;
  const secret = `secret-${crypto.randomUUID()}`;
  const [setError] = await attempt(Promise.all([
    store.set(`${nonce}:kid`, kid, { ex: 60 }),
    store.set(`${nonce}:secret`, secret, { ex: 60 }),
  ]));
  if (setError) {
    log.error(setError);
    return new Response(
      log.info(cannotCreateNonceSession(profile.publicKey)),
      { status: 500 },
    );
  }

  const [encryptError, challenge] = await attempt(encrypt(publicKey, secret));
  if (encryptError) {
    log.error(encryptError);
    return new Response(
      log.info(cannotEncryptChallenge(profile.publicKey)),
      { status: 500 },
    );
  }

  return new Response(
    log.info(issueChallenge(profile.publicKey, nonce, challenge)),
  );
};
