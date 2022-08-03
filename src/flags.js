import { parse } from "./deps.ts";

const transformers = {
  target({ target: v }) {
    if (!v) throw new Error("missing required argument 'target'");
    return new URL(v).origin;
  },
  async "profile-dir"({ "profile-dir": v }) {
    if (!v) throw new Error("missing required argument 'profile-dir'");
    const stat = await Deno.stat(v);
    if (!stat.isDirectory) throw new Error(`'${v}' is not a directory`);
    return v;
  },
  store({ store: v }) {
    if (v !== "in-memory") throw new Error(`unsupported store '${v}'`);
    return v;
  },
};

export default async (args) => {
  const parsedArgs = parse(args, {
    string: Object.keys(transformers),
    default: {
      store: "in-memory",
    },
    unknown(_, k) {
      throw new Error(`unrecognized argument "${k}"`);
    },
  });
  const flags = {};
  for (const [key, fn] of Object.entries(transformers)) {
    flags[key] = await fn(parsedArgs);
  }
  return flags;
};
