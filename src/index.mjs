#!/usr/bin/env node
import { createServer } from 'http';

const startChallenge = (req, res) => res.end('Start Challenge');
const completeChallenge = (req, res) => res.end('Complete Challenge');
const passthrough = (req, res) => res.writeHead(404).end();

const server = createServer((req, res) => {
  switch (true) {
    case req.url.startsWith('/_/start-challenge'):
      return startChallenge(req, res);
    case req.url.startsWith('/_/complete-challenge'):
      return completeChallenge(req, res);
    default:
      return passthrough(req, res);
  }
});

const port = 8000;
console.log(`Listening on port ${port}...`);
server.listen(port);
