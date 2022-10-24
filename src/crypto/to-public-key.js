export default (jwk) => {
  const partial = (algorithm, usages) =>
    crypto.subtle.importKey(
      "jwk",
      jwk,
      algorithm,
      false,
      usages,
    );
  switch (jwk.kty) {
    case "RSA":
      switch (jwk.alg) {
        case "RSA-OAEP-256":
          return partial({ name: "RSA-OAEP", hash: "SHA-256" }, ["encrypt"]);
        case "RSA-OAEP-384":
          return partial({ name: "RSA-OAEP", hash: "SHA-384" }, ["encrypt"]);
        case "RSA-OAEP-512":
          return partial({ name: "RSA-OAEP", hash: "SHA-512" }, ["encrypt"]);
        default:
          throw new Error(`The '${jwk.alg}' algorithm isn't supported`);
      }
    case "OKP":
      switch (jwk.crv) {
        case "Ed25519":
          return partial("Ed25519", ["verify"]);
        default:
          throw new Error(`The '${jwk.crv}' curve isn't supported`);
      }
    default:
      throw new Error(`The '${jwk.kty}' key type isn't supported`);
  }
};
