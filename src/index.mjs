#!/usr/bin/env node
import { createServer } from 'http';
import invokeRoute from './invoke-route';
import startChallenge from './routes/start-challenge';
import completeChallenge from './routes/complete-challenge';
import passThrough from './routes/pass-through';

const server = createServer((req, res) => {
  switch (req.url) {
    case '/_/start-challenge':
      return invokeRoute(startChallenge, req, res);
    case '/_/complete-challenge':
      return invokeRoute(completeChallenge, req, res);
    default:
      return invokeRoute(passThrough, req, res);
  }
});

const port = 8000;
console.log(`Listening on port ${port}...`);
server.listen(port);
