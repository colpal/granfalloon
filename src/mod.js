#!/usr/bin/env deno run --allow-net
import { serve } from './deps.ts';

serve((request) => {
  const url = new URL(request.url);
  switch (url.pathname) {
    case '/_/start-challenge':
      return new Response('Start Challenge');
    case '/_/complete-challenge':
      return new Response('Complete Challenge');
    default:
      return new Response(null, { status: 404 });
  }
});
