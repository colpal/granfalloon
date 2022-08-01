import { globToRegExp } from "../deps.ts";
import attempt from "../util/attempt.js";
import {
  blockedByProfile,
  cannotRetrieveSession,
  malformedAuthorization,
  missingAuthorization,
  missingProfile,
  sessionNotFound,
} from "../responses.js";

export default async (request, { store, profiles, target, token }) => {
  const authorization = request.headers.get("Authorization");
  if (!authorization) return missingAuthorization();

  const matches = authorization.match(/token (.*)/);
  if (!matches) return malformedAuthorization();
  const [_, session] = matches;

  const [getKIDError, kid] = await attempt(store.get(session));
  if (getKIDError) return cannotRetrieveSession();
  if (!kid) return sessionNotFound();

  const profile = profiles[kid];
  if (!profile) return missingProfile(kid);

  const { pathname } = new URL(request.url);
  const isAllowed = profile.allow.some(([method, glob]) => {
    return request.method === method && globToRegExp(glob).test(pathname);
  });
  if (!isAllowed) return blockedByProfile(kid, pathname);

  const headers = new Headers(request.headers);
  headers.set("Authorization", `token ${token}`);

  const url = new URL(pathname, target);
  return fetch(new Request(url, { ...request, headers }));
};
