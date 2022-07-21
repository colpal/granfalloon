export const create = () => ({});

export const get = (client, key) => client[key];

export const set = (client, key, value, expiration) => {
  const now = new Date();
  client[key] = value;
  setTimeout(() => {
    delete client[key];
  }, expiration.getTime() - now.getTime());
};
