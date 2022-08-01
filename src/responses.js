const error = (status, meta, ...errors) =>
  new Response(
    JSON.stringify({
      meta: { ...meta, timestamp: new Date() },
      errors,
    }),
    { status },
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
