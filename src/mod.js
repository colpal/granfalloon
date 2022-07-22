#!/usr/bin/env deno run --allow-net
import { serve } from './deps.ts';
import startChallenge from './routes/start-challenge.js'
import completeChallenge from './routes/complete-challenge.js';

serve((request) => {
  const url = new URL(request.url);
  switch (url.pathname) {
    case '/_/start-challenge':
      return startChallenge(request);
    case '/_/complete-challenge':
      return completeChallenge(request);
    default:
      return new Response(null, { status: 404 });
  }
});
