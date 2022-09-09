import startChallenge from "./routes/start-challenge.js";
import completeChallenge from "./routes/complete-challenge.js";
import passThrough from "./routes/pass-through.js";
import health from "./routes/health.js";

export default ({ store, profiles, remote, token, log }) => (request) => {
  const url = new URL(request.url);
  switch (url.pathname) {
    case "/_/start-challenge":
      return startChallenge(request, { store, profiles, log });
    case "/_/complete-challenge":
      return completeChallenge(request, { store, log });
    case "/_/health":
      return health();
    default:
      return passThrough(request, { store, profiles, remote, token, log });
  }
};
