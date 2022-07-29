import startChallenge from "./routes/start-challenge.js";
import completeChallenge from "./routes/complete-challenge.js";
import passThrough from "./routes/pass-through.js";

export default ({ store, profiles, target, token }) => (request) => {
  const url = new URL(request.url);
  switch (url.pathname) {
    case "/_/start-challenge":
      return startChallenge(request, { store, profiles });
    case "/_/complete-challenge":
      return completeChallenge(request, { store });
    default:
      return passThrough(request, { store, profiles, target, token });
  }
};
