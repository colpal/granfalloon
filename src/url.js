import { globToRegExp } from "./deps.ts";

export const isMatch = (allows, request) => {
  const { pathname } = new URL(request.url);
  return allows.some(([method, glob]) => {
    return request.method === method && globToRegExp(glob).test(pathname);
  });
};
