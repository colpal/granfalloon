import { globToRegExp } from "../deps.ts";
import attempt from "../util/attempt.js";

export default async (request, { store, profiles, target }) => {
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

  const { pathname } = new URL(request.url);
  const isAllowed = profile.allow.some(([method, glob]) => {
    return request.method === method && globToRegExp(glob).test(pathname);
  });
  if (!isAllowed) return new Response(null, { status: 403 });

  const url = new URL(pathname, target);
  return fetch(new Request(url, request));
};
