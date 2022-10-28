import { globToRegExp } from "./deps.ts";

export const isMatch = (allows, request) => {
  const { pathname } = new URL(request.url);
  return allows.some(([method, glob]) => {
    return request.method === method && globToRegExp(glob).test(pathname);
  });
};

export const shift = (remote, token, request) => {
  const headers = new Headers(request.headers);
  headers.set("Authorization", `token ${token}`);
  const { href, origin } = new URL(request.url);
  const url = new URL(href.replace(origin, ""), remote);
  return new Request(url, { ...request, headers });
};
