import attempt from "../util/attempt.js";
import { isMatch, shift } from "../url.js";
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

  const isAllowed = isMatch(profile.allow, request);
  if (!isAllowed) {
    return new Response(log.info(blockedByProfile(kid, pathname)), {
      status: 400,
    });
  }

  const outbound = shift(remote, request, token);
  log.info(
    JSON.stringify({ meta: { url: outbound.url, kid, timestamp: new Date() } }),
  );
  return fetch(outbound);
};
