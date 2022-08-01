import { crypto } from "../deps.ts";
import hash from "../hash.js";
import attempt from "../util/attempt.js";
import {
  cannotClearChallenge,
  cannotCreateSession,
  cannotRetrieveChallenge,
  createSession,
  incorrectAnswer,
  jsonRequired,
  jsonRequiredKeys,
  noActiveChallenge,
} from "../responses.js";

export default async (request, { store, log }) => {
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
    store.get(`${nonce}:secret`),
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
  if (answer !== expected) {
    store.del(`${nonce}:kid`);
    store.del(`${nonce}:secret`);
    return new Response(
      log.info(incorrectAnswer(nonce)),
      { status: 400 },
    );
  }

  const [clearNonceError] = await attempt(Promise.all([
    store.del(`${nonce}:kid`),
    store.del(`${nonce}:secret`),
  ]));
  if (clearNonceError) {
    log.error(clearNonceError);
    return new Response(
      log.info(cannotClearChallenge(nonce, kid)),
      { status: 500 },
    );
  }

  const session = `session-${crypto.randomUUID()}`;
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
