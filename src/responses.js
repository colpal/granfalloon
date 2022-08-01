const error = (status, meta, ...errors) =>
  new Response(
    JSON.stringify({
      meta: { ...meta, timestamp: new Date() },
      errors,
    }),
    { status },
  );

const data = (meta, data) =>
  new Response(
    JSON.stringify({
      meta: { ...meta, timestamp: new Date() },
      data,
    }),
  );

export const jsonRequired = () =>
  error(
    400,
    {},
    { detail: "A JSON body is required" },
  );

export const jsonRequiredKeys = (...ks) =>
  error(
    400,
    {},
    ...ks.map((k) => ({ detail: `The JSON body must include a "${k}" key` })),
  );

export const cannotThumbprint = (publicKey) =>
  error(
    400,
    { publicKey },
    { detail: "Could not calculate the public key's thumbprint" },
  );

export const unknownPublicKey = (publicKey) =>
  error(
    400,
    { publicKey },
    { detail: "The public key's thumbprint does not match any profiles" },
  );

export const invalidPublicKey = (publicKey) =>
  error(
    400,
    { publicKey },
    { detail: "Could not create a useable public key" },
  );

export const cannotCreateNonceSession = (publicKey) =>
  error(
    500,
    { publicKey },
    { detail: "Could not establish a nonce session" },
  );

export const cannotEncryptChallenge = (publicKey) =>
  error(
    500,
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
    500,
    { nonce },
    { detail: "Could not retrieve stored challenge information" },
  );

export const noActiveChallenge = (nonce) =>
  error(
    400,
    { nonce },
    { detail: "No active challenge found for this nonce" },
  );

export const incorrectAnswer = (nonce) =>
  error(
    400,
    { nonce },
    { detail: "Provided answer does not satisfy challenge" },
  );

export const cannotClearChallenge = (nonce, kid) =>
  error(
    500,
    { nonce, kid },
    { detail: "Could not clear challenge session" },
  );

export const cannotCreateSession = (kid) =>
  error(
    500,
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
    401,
    {},
    { detail: "The Authorization header is required" },
  );

export const malformedAuthorization = () =>
  error(
    401,
    {},
    { detail: "The Authorization header must have the format 'token {TOKEN}'" },
  );

export const cannotRetrieveSession = () =>
  error(
    500,
    {},
    { detail: "Cannot retrieve session information from the store" },
  );

export const sessionNotFound = () =>
  error(
    401,
    {},
    { detail: "Session not found. It may have expired" },
  );

export const missingProfile = (kid) =>
  error(
    500,
    { kid },
    { detail: "The profile matching the session could not be found" },
  );
