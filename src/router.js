export default ({ store, profiles, target }) => (request) => {
  const url = new URL(request.url);
  switch (url.pathname) {
    case "/_/start-challenge":
      return startChallenge(request, { store, profiles });
    case "/_/complete-challenge":
      return completeChallenge(request, { store });
    default:
      return passThrough(request, { store, profiles, target });
  }
};
