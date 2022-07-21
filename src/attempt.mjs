export default (fn, ...args) => {
  switch (true) {
    case fn instanceof Function:
      try {
        return [null, fn(...args)];
      } catch (e) {
        return [e, null];
      }
    case fn instanceof Promise:
      return fn
        .then((x) => [null, x])
        .catch((e) => [e, null]);
    default:
      throw new Error('"attempt" must be called with a Function/Promise"');
  }
};
