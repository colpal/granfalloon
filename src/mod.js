#!/usr/bin/env deno run --allow-net --allow-read
import { serve } from './deps.ts';
import * as profile from './profile.js'
import startChallenge from './routes/start-challenge.js'
import completeChallenge from './routes/complete-challenge.js';
import * as Store from './store/in-memory.js';

const profiles = await Promise.all(Deno.args.map(profile.load));

const store = Store.create();

serve((request) => {
  const url = new URL(request.url);
  switch (url.pathname) {
    case '/_/start-challenge':
      return startChallenge(request, { store });
    case '/_/complete-challenge':
      return completeChallenge(request);
    default:
      return new Response(null, { status: 404 });
  }
});
