export default async (request, { store, profiles }) => {
  const authorization = request.headers.get("Authorization");
  if (!authorization) return new Response(null, { status: 401 });

  const matches = authorization.match(/token (.*)/);
  if (!matches) return new Response(null, { status: 401 });
  const [_, session] = matches;

  const [getKIDError, kid] = await attempt(store.get(session));
  if (getKIDError) return new Response(null, { status: 500 });
  if (!kid) return new Response(null, { status: 401 });

  const profile = profiles[kid];
  if (!profile) return new Response(null, { status: 500 });

  const isAllowed = profiles.allow.some(() => false);
  if (!isAllowed) return new Response(null, { status: 403 });

  return new Response(null, { status: 200 });
};
