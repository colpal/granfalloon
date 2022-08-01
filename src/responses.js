export const jsonRequired = () =>
  new Response(
    JSON.stringify({
      meta: { timestamp: new Date() },
      errors: [{
        detail: "A JSON body is required",
      }],
    }),
    { status: 400 },
  );

export const jsonRequiredKeys = (...ks) =>
  new Response(
    JSON.stringify({
      meta: { timestamp: new Date() },
      errors: ks.map((k) => ({
        detail: `The JSON body must include a "${k}" key`,
      })),
    }),
    { status: 400 },
  );

export const cannotThumbprint = (publicKey) =>
  new Response(
    JSON.stringify({
      meta: { timestamp: new Date(), publicKey },
      errors: [{
        detail: "Could not calculate the public key's thumbprint",
      }],
    }),
    { status: 400 },
  );
