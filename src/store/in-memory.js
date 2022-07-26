const get = (store) => (key) => store[key];

const del = (store) => (key) => {
  delete store[key];
};

const set = (store) => (key, value, { ex }) => {
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
