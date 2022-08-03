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

export default async (request, { store, profiles, remote, token, log }) => {
  const authorization = request.headers.get("Authorization");
  if (!authorization) {
    return new Response(
      log.info(missingAuthorization()),
      { status: 400 },
    );
  }

  const matches = authorization.match(/token (.*)/);
  if (!matches) {
    return new Response(log.info(malformedAuthorization()), { status: 400 });
  }
  const [_, session] = matches;

  const [getKIDError, kid] = await attempt(store.get(session));
  if (getKIDError) {
    log.error(getKIDError);
    return new Response(log.info(cannotRetrieveSession()), { status: 500 });
  }
  if (!kid) return new Response(log.info(sessionNotFound()), { status: 400 });

  const profile = profiles[kid];
  if (!profile) {
    return new Response(log.info(missingProfile(kid)), { status: 500 });
  }

  const { pathname } = new URL(request.url);
  const isAllowed = profile.allow.some(([method, glob]) => {
    return request.method === method && globToRegExp(glob).test(pathname);
  });
  if (!isAllowed) {
    return new Response(log.info(blockedByProfile(kid, pathname)), {
      status: 400,
    });
  }

  const headers = new Headers(request.headers);
  headers.set("Authorization", `token ${token}`);

  const url = new URL(pathname, remote);
  log.info(JSON.stringify({ meta: { url, kid } }));
  return fetch(new Request(url, { ...request, headers }));
};
