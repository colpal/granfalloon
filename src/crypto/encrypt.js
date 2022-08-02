import { base64Encode, crypto } from "../deps.ts";

export default async (key, s) => {
  const encrypted = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    key,
    new TextEncoder().encode(s),
  );
  return base64Encode(encrypted);
};
