import toPublicKey from "../crypto/to-public-key.js";
import createChallenge from "../crypto/create-challenge.js";
import attempt from "../util/attempt.js";
import thumbprint from "../crypto/thumbprint.js";
import {
  cannotCreateChallenge,
  cannotCreateNonceSession,
  cannotThumbprint,
  invalidPublicKey,
  issueChallenge,
  jsonRequired,
  jsonRequiredKeys,
  unknownPublicKey,
} from "../responses.js";

export default async (request, { store, profiles, log }) => {
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

  const [keyImportError, publicKey] = await attempt(toPublicKey(
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
  const answer = `secret-${crypto.randomUUID()}`;
  const [setError] = await attempt(Promise.all([
    store.set(`${nonce}:kid`, kid, { ex: 60 }),
    store.set(`${nonce}:answer`, answer, { ex: 60 }),
  ]));
  if (setError) {
    log.error(setError);
    return new Response(
      log.info(cannotCreateNonceSession(profile.publicKey)),
      { status: 500 },
    );
  }

  const [challengeError, challenge] = await attempt(
    createChallenge(publicKey, answer),
  );
  if (challengeError) {
    log.error(challengeError);
    return new Response(
      log.info(cannotCreateChallenge(profile.publicKey)),
      { status: 500 },
    );
  }

  return new Response(
    log.info(issueChallenge(profile.publicKey, nonce, challenge)),
  );
};
