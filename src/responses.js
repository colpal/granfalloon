const error = (status, meta, ...errors) =>
  new Response(
    JSON.stringify({
      meta,
      errors,
    }),
    { status },
  );

export const jsonRequired = () =>
  error(
    400,
    { timestamp: new Date() },
    { detail: "A JSON body is required" },
  );

export const jsonRequiredKeys = (...ks) =>
  error(
    400,
    { timestamp: new Date() },
    ...ks.map((k) => ({ detail: `The JSON body must include a "${k}" key` })),
  );

export const cannotThumbprint = (publicKey) =>
  error(
    400,
    { publicKey, timestamp: new Date() },
    { detail: "Could not calculate the public key's thumbprint" },
  );
