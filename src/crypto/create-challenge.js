import { base64Encode } from "../deps.ts";

export default async (key, s) => {
  switch (true) {
    case key.usages.includes("verify"):
      return s;
    case key.usages.includes("encrypt"):
      return base64Encode(
        await crypto.subtle.encrypt(
          "RSA-OAEP",
          key,
          new TextEncoder().encode(s),
        ),
      );
    default:
      throw new Error("This key cannot be used to create a challenge");
  }
};
