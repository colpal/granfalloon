export const create = () => ({});

export const get = (client, key) => client[key];

export const set = (client, key, value, ex = null) => {
  client[key] = value;
  if (ex) {
    setTimeout(() => {
      delete client[key];
    }, ex * 1000);
  }
};
