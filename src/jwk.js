export function thumbprint(k) {
  switch (k.kty) {
    case "RSA":
      return 0;
    default:
      throw new Error(`Unsupported kty: "${k.kty}"`);
  }
}
