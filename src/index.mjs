#!/usr/bin/env node
import { createServer } from 'http';

const server = createServer((req, res) => {
  switch (true) {
    case req.url.startsWith('/_/start-challenge'):
      return res.end('Start Challenge');
    case req.url.startsWith('/_/complete-challenge'):
      return res.end('Complete Challenge');
    default:
      return res.writeHead(404).end();
  }
});

const port = 8000;
console.log(`Listening on port ${port}...`);
server.listen(port);
