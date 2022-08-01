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
