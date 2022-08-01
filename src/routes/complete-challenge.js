import { crypto } from "../deps.ts";
import attempt from "../util/attempt.js";
import { jsonRequired } from "../responses.js";

export default async (request, { store }) => {
  const [bodyError, { nonce, answer }] = await attempt(request.json());
  if (bodyError) return jsonRequired();

  if (!nonce) {
    return new Response("The JSON body must include a 'nonce' key", {
      status: 400,
    });
  }

  if (!answer) {
    return new Response("The JSON body must include an 'answer' key", {
      status: 400,
    });
  }

  const [getError, [kid, expected]] = await attempt(Promise.all([
    store.get(`${nonce}:kid`),
    store.get(`${nonce}:secret`),
  ]));
  if (getError) {
    return new Response("Could not retrieve stored challenge information", {
      status: 500,
    });
  }
  if (!kid || !expected) {
    return new Response("No active challenge found for that nonce", {
      status: 400,
    });
  }
  if (answer !== expected) {
    store.del(`${nonce}:kid`);
    store.del(`${nonce}:secret`);
    return new Response("Provided answer does not satisfy challenge", {
      status: 400,
    });
  }

  const [clearNonceError] = await attempt(Promise.all([
    store.del(`${nonce}:kid`),
    store.del(`${nonce}:secret`),
  ]));
  if (clearNonceError) {
    return new Response("Could not clear challenge session", { status: 500 });
  }

  const session = `session-${crypto.randomUUID()}`;
  const [setError] = await attempt(store.set(session, kid, { ex: 60 * 60 }));
  if (setError) {
    return new Response("Could not establish session", { status: 500 });
  }

  return new Response(JSON.stringify({ data: { session } }));
};
