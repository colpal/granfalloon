import { base64Decode } from "../deps.ts";

export default async (key, b64) => {
  let fn;
  switch (true) {
    case key.usages.includes("sign"):
      fn = crypto.subtle.sign.bind(crypto.subtle);
      break;
    case key.usages.includes("decrypt"):
      fn = crypto.subtle.decrypt.bind(crypto.subtle);
      break;
    default:
      throw new Error("The supplied key can not be used to answer a challenge");
  }
  const ab = await fn(
    key.algorithm.name,
    key,
    base64Decode(b64),
  );
  return new TextDecoder().decode(ab);
};
