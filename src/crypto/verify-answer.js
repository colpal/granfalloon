import { base64Decode } from "../deps.ts";

export default async (key, expected, answer) => {
  switch (true) {
    case key.usages.includes("verify"):
      return await crypto.subtle.verify(
        key.algorithm.name,
        key,
        base64Decode(answer),
        new TextEncoder().encode(expected),
      );
    case key.usages.includes("encrypt"):
      return expected === answer;
    default:
      throw new Error("The supplied key cannot be used to verify answers");
  }
};
