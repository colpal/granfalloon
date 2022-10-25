import { base64Decode, base64Encode } from "../deps.ts";

export default async (key, challenge) => {
  switch (true) {
    case key.usages.includes("sign"):
      return base64Encode(
        await crypto.subtle.sign(
          key.algorithm.name,
          key,
          new TextEncoder().encode(challenge),
        ),
      );
    case key.usages.includes("decrypt"):
      return new TextDecoder().decode(
        await crypto.subtle.decrypt(
          key.algorithm.name,
          key,
          base64Decode(challenge),
        ),
      );
    default:
      throw new Error("The supplied key can not be used to answer a challenge");
  }
};
