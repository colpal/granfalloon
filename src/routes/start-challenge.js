import attempt from '../attempt.js';

export default async (request) => {
  const [bodyError, body] = await attempt(request.json());
  if (bodyError) {
    return new Response('A JSON body is required', { status: 422 });
  }

  if (!body.publicKey) {
    return new Response('The JSON body must include a "publicKey" key', {
      status: 422
    });
  }

  return new Response();
};
