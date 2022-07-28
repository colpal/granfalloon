// deno-lint-ignore require-await
const get = (store) => async (key) => store[key];

// deno-lint-ignore require-await
const del = (store) => async (key) => {
  delete store[key];
};

// deno-lint-ignore require-await
const set = (store) => async (key, value, { ex }) => {
  store[key] = value;
  if (ex) {
    setTimeout(() => {
      del(store)(key);
    }, ex * 1000);
  }
};

export const create = () => {
  const store = {};
  return { get: get(store), set: set(store), del: del(store) };
};
