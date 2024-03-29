import { parse } from "./deps.ts";
import version from "./version.js";

const transformers = {
  boolean: {
    version({ version: v }) {
      if (v) {
        console.log(`v${version}`);
        Deno.exit(0);
      }
    },
  },
  string: {
    port({ port: v }) {
      if (!v) return 8000;
      const port = parseInt(v);
      if (Number.isNaN(port) || port < 1 || port > 65535) {
        throw new Error(`invalid port number '${v}'`);
      }
      return port;
    },
    remote({ remote: v }) {
      if (!v) throw new Error("missing required argument 'remote'");
      return new URL(v).origin;
    },
    async "profile-dir"({ "profile-dir": v }) {
      if (!v) throw new Error("missing required argument 'profile-dir'");
      const stat = await Deno.stat(v);
      if (!stat.isDirectory) throw new Error(`'${v}' is not a directory`);
      return v;
    },
    store({ store: v }) {
      const valid = new Set(["in-memory", "redis"]);
      if (!valid.has(v)) throw new Error(`unsupported store '${v}'`);
      return v;
    },
    "redis-hostname"({ "redis-hostname": v, store }) {
      if (store !== "redis" && v) {
        throw new Error("'redis-hostname' is only valid with '--store=redis'");
      }
      if (store !== "redis") {
        return v;
      }
      if (store === "redis" && !v) {
        throw new Error("'redis-hostname' must be provided");
      }
      return v;
    },
    "redis-port"({ "redis-port": v, store }) {
      if (store !== "redis" && v) {
        throw new Error("'redis-port' is only valid with '--store=redis'");
      }
      if (store !== "redis") {
        return v;
      }
      if (store === "redis" && !v) {
        throw new Error("'redis-port' must be provided");
      }
      const port = parseInt(v);
      if (Number.isNaN(port) || port < 1 || port > 65535) {
        throw new Error(`invalid port number '${v}'`);
      }
      return port;
    },
  },
};

export default async (args) => {
  const parsedArgs = parse(args, {
    string: Object.keys(transformers.string),
    boolean: Object.keys(transformers.boolean),
    default: {
      store: "in-memory",
    },
    unknown(_, k) {
      throw new Error(`unrecognized argument "${k}"`);
    },
  });
  const flags = {};
  const allTransformers = { ...transformers.boolean, ...transformers.string };
  for (const [key, fn] of Object.entries(allTransformers)) {
    flags[key] = await fn(parsedArgs);
  }
  return flags;
};
