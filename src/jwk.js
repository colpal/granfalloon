import { crypto } from './deps.ts';

async function thumbprintRSA(jwk) {
  const container = {};
  ["e", "kty", "n"].forEach(k => {
    container[k] = jwk[k];
  });
  const json = JSON.stringify(container);
  const textEncoder = new TextEncoder();
  const encoded = textEncoder.encode(json);
  const hash = await crypto.subtle.digest('SHA-256', encoded);
  return '';
}

export function thumbprint(k) {
  switch (k.kty) {
    case "RSA":
      return thumbprintRSA(k);
    default:
      throw new Error(`Unsupported kty: "${k.kty}"`);
  }
}
