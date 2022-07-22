#!/usr/bin/env deno run --allow-net
import { serve } from './deps.ts';
import startChallenge from './routes/start-challenge.js'

serve((request) => {
  const url = new URL(request.url);
  switch (url.pathname) {
    case '/_/start-challenge':
      return startChallenge(request);
    case '/_/complete-challenge':
      return new Response('Complete Challenge');
    default:
      return new Response(null, { status: 404 });
  }
});
