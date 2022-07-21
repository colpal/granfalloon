import getJSON from '../get-json.mjs';
import attempt from '../attempt.mjs';

export default async (request) => {
  const [bodyError, body] = await attempt(getJSON(request));
  if (bodyError) {
    return {
      status: 422,
      body: 'A JSON body is required',
    };
  }

  if (!body.publicKey) {
    return {
      status: 422,
      body: 'The JSON body must include a "publicKey" key',
    };
  }

  return { status: 200 };
};
