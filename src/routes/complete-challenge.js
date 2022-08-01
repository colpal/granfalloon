import { crypto } from "../deps.ts";
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

export default async (request, { store }) => {
  const [bodyError, body] = await attempt(request.json());
  if (bodyError) return jsonRequired();

  const requiredKeys = ["nonce", "answer"];
  const missingKeys = requiredKeys.filter((rk) => !body[rk]);
  if (missingKeys.length > 0) return jsonRequiredKeys(missingKeys);
  const { nonce, answer } = body;

  const [getError, [kid, expected]] = await attempt(Promise.all([
    store.get(`${nonce}:kid`),
    store.get(`${nonce}:secret`),
  ]));
  if (getError) return cannotRetrieveChallenge(nonce);
  if (!kid || !expected) return noActiveChallenge(nonce);
  if (answer !== expected) {
    store.del(`${nonce}:kid`);
    store.del(`${nonce}:secret`);
    return incorrectAnswer(nonce);
  }

  const [clearNonceError] = await attempt(Promise.all([
    store.del(`${nonce}:kid`),
    store.del(`${nonce}:secret`),
  ]));
  if (clearNonceError) return cannotClearChallenge(nonce, kid);

  const session = `session-${crypto.randomUUID()}`;
  const [setError] = await attempt(store.set(session, kid, { ex: 60 * 60 }));
  if (setError) return cannotCreateSession(kid);

  return createSession(kid, session);
};
