import { parse } from "./deps.ts";

const requiredArguments = ["target", "profile-dir"];

export default async (args) => {
  const parsedArgs = parse(args, {
    string: requiredArguments,
    unknown(_, k) {
      throw new Error(`unrecognized argument "${k}"`);
    },
  });
  for (const arg of requiredArguments) {
    if (!parsedArgs[arg]) throw new Error(`missing required argument "${arg}"`);
  }
  const { target, "profile-dir": profileDir } = parsedArgs;
  return {
    profileDir: (await Deno.stat(profileDir)).isDirectory && profileDir,
    target: new URL(target).origin,
  };
};
