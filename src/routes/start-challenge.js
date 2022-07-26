import { crypto } from "../deps.ts";
import attempt from '../attempt.js';
import { thumbprint } from '../jwk.js';

export default async (request, { store, profiles }) => {
  const [bodyError, body] = await attempt(request.json());
  if (bodyError) {
    return new Response('A JSON body is required', { status: 422 });
  }

  if (!body.publicKey) {
    return new Response('The JSON body must include a "publicKey" key', {
      status: 422
    });
  }

  const [thumbprintError, kid] = await attempt(thumbprint(body.publicKey));
  if (thumbprintError) {
    return new Response("Could not calculate the public key's thumbprint", {
      status: 400,
    });
  }

  const profile = profiles[kid];
  if (!profile) {
    return new Response("Public key's thumbprint does not match any profiles", {
      status: 400
    });
  }

  const [keyImportError, publicKey] = await attempt(crypto.subtle.importKey(
    "jwk",
    profile.publicKey,
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["encrypt"],
  ));
  if (keyImportError) {
    return new Response("Could not create a useable public key", {
      status: 400,
    });
  }

  return new Response();
};
