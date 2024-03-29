import hash from "../crypto/hash.js";
import attempt from "../util/attempt.js";
import verifyAnswer from "../crypto/verify-answer.js";
import toPublicKey from "../crypto/to-public-key.js";
import {
  cannotClearChallenge,
  cannotCreateSession,
  cannotRetrieveChallenge,
  cannotVerifyAnswer,
  createSession,
  incorrectAnswer,
  invalidPublicKey,
  jsonRequired,
  jsonRequiredKeys,
  noActiveChallenge,
} from "../responses.js";

export default async (request, { store, log, profiles }) => {
  const [bodyError, body] = await attempt(request.json());
  if (bodyError) {
    log.error(bodyError);
    return new Response(
      log.info(jsonRequired()),
      { status: 400 },
    );
  }

  const requiredKeys = ["nonce", "answer"];
  const missingKeys = requiredKeys.filter((rk) => !body[rk]);
  if (missingKeys.length > 0) {
    return new Response(
      log.info(jsonRequiredKeys(missingKeys)),
      { status: 400 },
    );
  }
  const { nonce, answer } = body;

  const [getError, [kid, expected]] = await attempt(Promise.all([
    store.get(`${nonce}:kid`),
    store.get(`${nonce}:answer`),
  ]));
  if (getError) {
    log.error(getError);
    return new Response(
      log.info(cannotRetrieveChallenge(nonce)),
      { status: 500 },
    );
  }
  if (!kid || !expected) {
    return new Response(
      log.info(noActiveChallenge(nonce)),
      { status: 400 },
    );
  }

  const [keyImportError, key] = await attempt(toPublicKey(
    profiles[kid].publicKey,
  ));
  if (keyImportError) {
    log.error(keyImportError);
    return new Response(
      log.info(invalidPublicKey(profiles[kid].publicKey)),
      { status: 500 },
    );
  }

  const [verificationError, verified] = await attempt(verifyAnswer(
    key,
    expected,
    answer,
  ));
  if (verificationError) {
    log.error(verificationError);
    return new Response(
      log.info(cannotVerifyAnswer(nonce)),
      { status: 500 },
    );
  }

  if (!verified) {
    store.del(`${nonce}:kid`);
    store.del(`${nonce}:answer`);
    return new Response(
      log.info(incorrectAnswer(nonce)),
      { status: 400 },
    );
  }

  const [clearNonceError] = await attempt(Promise.all([
    store.del(`${nonce}:kid`),
    store.del(`${nonce}:answer`),
  ]));
  if (clearNonceError) {
    log.error(clearNonceError);
    return new Response(
      log.info(cannotClearChallenge(nonce, kid)),
      { status: 500 },
    );
  }

  const session = `granfalloon-session_${crypto.randomUUID()}`;
  const [setError] = await attempt(store.set(session, kid, { ex: 60 * 60 }));
  if (setError) {
    return new Response(
      log.info(cannotCreateSession(kid)),
      { status: 500 },
    );
  }

  const sessionHash = await hash("SHA-256", session);
  log.info(createSession(kid, `sha256:${sessionHash}`));
  return new Response(createSession(kid, session));
};
