import attempt from "../attempt.js";

export default async (request, { store }) => {
  const [bodyError, { nonce, answer }] = await attempt(request.json());
  if (bodyError) {
    return new Response("A JSON body is required", { status: 400 });
  }

  if (!nonce) {
    return new Response("The JSON body must include a 'nonce' key", {
      status: 400,
    });
  }

  if (!answer) {
    return new Response("The JSON body must include an 'answer' key", {
      status: 400,
    });
  }

  const [expectedGetError, expected] = await attempt(store.get(nonce));
  if (expectedGetError) {
    return new Response("Could not retrieve answer from the store", {
      status: 500,
    });
  }
  if (!expected) {
    return new Response("No active challenge found for that nonce", {
      status: 400,
    });
  }

  return new Response("Complete Challenge");
};
