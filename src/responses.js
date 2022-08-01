const error = (meta, ...errors) =>
  JSON.stringify({
    meta: { ...meta, timestamp: new Date() },
    errors,
  });

const data = (meta, data) =>
  JSON.stringify({
    meta: { ...meta, timestamp: new Date() },
    data,
  });

export const jsonRequired = () =>
  error(
    {},
    { detail: "A JSON body is required" },
  );

export const jsonRequiredKeys = (...ks) =>
  error(
    {},
    ...ks.map((k) => ({ detail: `The JSON body must include a "${k}" key` })),
  );

export const cannotThumbprint = (publicKey) =>
  error(
    { publicKey },
    { detail: "Could not calculate the public key's thumbprint" },
  );

export const unknownPublicKey = (publicKey) =>
  error(
    { publicKey },
    { detail: "The public key's thumbprint does not match any profiles" },
  );

export const invalidPublicKey = (publicKey) =>
  error(
    { publicKey },
    { detail: "Could not create a useable public key" },
  );

export const cannotCreateNonceSession = (publicKey) =>
  error(
    { publicKey },
    { detail: "Could not establish a nonce session" },
  );

export const cannotEncryptChallenge = (publicKey) =>
  error(
    { publicKey },
    { detail: "Could not encrypt challenge secret" },
  );

export const issueChallenge = (publicKey, nonce, challenge) =>
  data(
    { publicKey },
    { nonce, challenge },
  );

export const cannotRetrieveChallenge = (nonce) =>
  error(
    { nonce },
    { detail: "Could not retrieve stored challenge information" },
  );

export const noActiveChallenge = (nonce) =>
  error(
    { nonce },
    { detail: "No active challenge found for this nonce" },
  );

export const incorrectAnswer = (nonce) =>
  error(
    { nonce },
    { detail: "Provided answer does not satisfy challenge" },
  );

export const cannotClearChallenge = (nonce, kid) =>
  error(
    { nonce, kid },
    { detail: "Could not clear challenge session" },
  );

export const cannotCreateSession = (kid) =>
  error(
    { kid },
    { detail: "Cloud not establish session" },
  );

export const createSession = (kid, session) =>
  data(
    { kid },
    { session },
  );

export const missingAuthorization = () =>
  error(
    {},
    { detail: "The Authorization header is required" },
  );

export const malformedAuthorization = () =>
  error(
    {},
    { detail: "The Authorization header must have the format 'token {TOKEN}'" },
  );

export const cannotRetrieveSession = () =>
  error(
    {},
    { detail: "Cannot retrieve session information from the store" },
  );

export const sessionNotFound = () =>
  error(
    {},
    { detail: "Session not found. It may have expired" },
  );

export const missingProfile = (kid) =>
  error(
    { kid },
    { detail: "The profile matching the session could not be found" },
  );

export const blockedByProfile = (kid, pathname) =>
  error(
    { kid, pathname },
    { detail: "The profile associated with this session blocked the request" },
  );
