const get = (store) => (key) => store[key];

const set = (store) => (key, value, { ex }) => {
  store[key] = value;
  if (ex) {
    setTimeout(() => {
      delete store[key];
    }, ex * 1000);
  }
};

export const create = () => {
  const store = {};
  return { get: get(store), set: set(store) };
};
