import { base64Decode, crypto } from "../deps.ts";

export default async (key, encryptedB64) => {
  const ab = await crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    key,
    base64Decode(encryptedB64),
  );
  return new TextDecoder().decode(ab);
};
