# Granfalloon

> "The one who is many"
>
> \- _Castlevania_

Granfalloon is a reverse-proxy that allows secure, distributed usage of a
typically centralized secret

# Usage

```sh
# server

$ cat profiles/example.json
{
  "publicKey": {
    "kty": "OKP",
    "crv": "Ed25519",
    "x": "..."
  },
  "allow": [
    ["GET", "/orgs/*/repos"],
    ["GET", "/user"]
  ]
}
$ cat .env
export GRANFALLOON_TOKEN=ghp_shared-user-token
$ source .env
$ ./granfalloon --remote=https://api.github.com --profile-dir=profiles/
Listening on http://localhost:8000/
```

```sh
# client

# Start a challenge by sending your pre-configured public key
$ curl -d '...' http://localhost:8000/_/start-challenge | jq .data
{
  "nonce": "granfalloon-nonce_00000000-0000-0000-0000-000000000000",
  "challenge": "granfalloon-unsigned_00000000-0000-0000-0000-000000000000"
}

# Complete a challenge by sending the signed/decrypted answer with your nonce
$ curl -d '...' http://localhost:8000/_/complete-challenge | jq .data
{
  "session": "granfalloon-session_00000000-0000-0000-0000-000000000000"
}

# Patterns allowed by the app's profile will be proxied with authentication
$ curl -H "Authorization: token granfalloon-session_..." http://localhost:8000/user | jq
{
  "login": "shared-user",
  # ...
}

# Patterns not allowed by the app's profile will fail immediately
$ curl -H "Authorization: token granfalloon-session_..." http://localhost:8000/emojis | jq .errors
[ { detail: "The profile associated with this session blocked the request" } ]
```

# Security

## Hosting

Granfalloon should **never** be hosted without HTTPS! Granfalloon's
authentication protocol alone is not sufficient to prove the identity of the
server (it is not a mutual authentication). If you access Granfalloon over raw
HTTP, it is trivial for an attacker to MITM an authentication attempt and
acquire a session. Granfalloon (at this time) does not support end-to-end
encryption, so you will need to configure some form of TLS termination.

# OCI Usage

```sh
$ docker run \
    --init \
    --env GRANFALLOON_TOKEN \
    --volume "$HOST_PROFILE_DIRECTORY":/profiles \
    --publish "$HOST_PORT":8000
    ghcr.io/colpal/granfalloon:"$TAG" \
    --remote=$REMOTE
```

# Kubernetes Usage

Please see the [`/kubernetes`](./kubernetes) directory

# Environment Variables

## `GRANFALLOON_TOKEN`

**Required**

The token to inject into forwarded calls to the `remote`. It will replace the
`Authorization` header with the format `token {{GRANFALLOON_TOKEN}}`.

# Command-Line Arguments

## `--version`

Prints out the version of Granfalloon, and then immediately exits successfully

## `--port`

**Default: 8000**

The port on which Granfalloon should listen for connections

## `--remote REMOTE_URL`

**Required**

The remote base URL to which valid requests should be forwarded

## `--profile-dir PATH_TO_DIRECTORY`

**Required**

The directory from which application profiles should be loaded. Any files with
the `.json` extension are assumed to be application profiles.

If you would like to add or update existing application profiles without
restarting Granfalloon, you may send a `SIGHUP` signal to the process. This
will cause Granfalloon to reload the profiles from the directory provided on
startup. Notably, this cannot remove any previously loaded application
profiles.

## `--store (in-memory|redis)`

**Default: in-memory**

The mechanism to use for challenge-response and session storage.

### in-memory

The application will manage storage using native data structures in the
runtime. While this storage mechanism is suitable for simple use cases and
demonstrations, it does not support manually revoking sessions and will be
difficult to scale.

### redis

The application will manage storage using an existing, external Redis service.

## `--redis-hostname HOSTNAME`

**Required if `--store=redis` is provided**

The hostname of the external Redis service.

## `--redis-port PORT`

**Required if `--store=redis` is provided**

The listening port of the external Redis service.

# Profiles

## Example

```jsonc
{
  // The name of the application profile
  "name": "example",
  // The public-key portion of a key pair formatted as a JWK
  "publicKey": {
    "kty": "OKP",
    "alg": "EdDSA",
    "crv": "Ed25519",
    "x": "0_Wi5E-xXujsb_rrZ5NbDHmdji2I-ix6XIzim7b4DN8",
    "key_ops": [
      "verify"
    ],
    "ext": true
  },
  // The request patterns to allow for this profile. Globs are supported
  "allow": [
    ["GET", "/user"]
    ["GET", "/users/**"]
    ["GET", "/orgs/*/repos"],
  ]
}
```

## Schema

```typescript
type RequestMethod =
  | "GET"
  | "HEAD"
  | "POST"
  | "PUT"
  | "DELETE"
  | "CONNECT"
  | "OPTIONS"
  | "TRACE"
  | "PATCH";

type Ed25519PublicJWK = {
  kty: "OKP";
  crv: "Ed25519";
  x: string;
  alg?: "EdDSA";
  key_ops?: ["verify"];
  ext?: boolean;
};

type RSAPublicJWK = {
  kty: "RSA";
  alg: "RSA-OAEP-256" | "RSA-OAEP-384" | "RSA-OAEP-512";
  n: string;
  e: string;
  key_ops?: ["encrypt"];
  ext?: boolean;
};

interface Profile {
  name?: string;
  allow: Array<[RequestMethod, string]>;
  publicKey: Ed25519PublicJWK | RSAPublicJWK;
}
```

# Key Pairs

## Creation

To register a profile with Granfalloon, you must supply the public portion of
an asymmetric key pair, formatted as a JWK. Authenticating to Granfalloon
requires signing/decrypting a challenge using the associated private key. At
the moment, Granfalloon supports the following key pair types:

- Ed25519 (Recommended)
- RSA-OAEP-256
- RSA-OAEP-384
- RSA-OAEP-512

You may use any method to generate one of the above key pairs in the JWK
format. If you do not have a preferred method in mind, you may also use the
[`bin/generate-keys.js`](./bin/generate-keys.js) Deno script

## Usage

For testing purposes, this repository includes examples of how to sign/decrypt
using a JWK-formatted private key at
[`src/crypto/to-private-key.js`](src/crypto/to-private-key.js) and
[`src/crypto/answer-challenge.js`](src/crypto/answer-challenge.js).

However, it should be possible to leverage the JWK-formatted private key in
most major languages/platforms:

- [Deno/Web Crypto](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/decrypt)
- [Node.js](https://nodejs.org/api/crypto.html#cryptoprivatedecryptprivatekey-buffer)

# API

## `POST /_/start-challenge`

Initiate a challenge-response authentication attempt which must be completed
within 60 seconds.

### Request

- `.publicKey` `required` - A JWK-formatted public-key matching one of those
  found in the currently active application profiles

### Response

- `.data.nonce` - A one-time use, randomly generated identifier for the newly
  created challenge-response authentication attempt.
- `.data.challenge` - If the associated public key is Ed25519-based, this will
  contain the plaintext (unsigned) answer to the challenge. If the associated
  public key is RSA-based, this will contain the answer to the challenge, first
  encrypted with the associated private key, then base64-encoded.

### Example

```sh
$ cat payload.json
{
  "publicKey": {
    "kty": "OKP",
    "crv": "Ed25519",
    "x": "0_Wi5E-xXujsb_rrZ5NbDHmdji2I-ix6XIzim7b4DN8"
  }
}

$ curl \
    --data @payload.json \
    http://localhost:8000/_/start-challenge
```

```json
{
  "meta": {
    "publicKey": {
      "kty": "OKP",
      "crv": "Ed25519",
      "x": "0_Wi5E-xXujsb_rrZ5NbDHmdji2I-ix6XIzim7b4DN8"
    },
    "timestamp": "2022-08-09T21:04:46.128Z"
  },
  "data": {
    "nonce": "granfalloon-nonce_00000000-0000-0000-0000-000000000000",
    "challenge": "granfalloon-unsigned_00000000-0000-0000-0000-000000000000"
  }
}
```

## `POST /_/complete-challenge`

Complete a recently initiated challenge-response authentication attempt

> Note: Each challenge may only be attempted once; whether it succeeds or
> fails, the associated nonce will no longer be useable

### Request

- `.nonce` `required` - A nonce previously returned by the `/_/start-challenge`
  endpoint
- `.answer` `required` - If the key associated with the profile is
  Ed25519-based, this must be the challenge value signed with the associated
  private-key, then base64-encoded. If the key associated with the profile is
  RSA-based, this must be the decrypted challenge value in plaintext.

### Response

- `.data.session` - A session token for the profile that initiated the
  challenge-response authentication attempt

### Example

```sh
$ cat payload.json
{
  "nonce": "granfalloon-nonce_cf0e9b8f-a498-4451-8686-915effb8d2f0",
  "answer": "dGhlIHF1aWNrIGJyb3duIGZveCBqdW1wcyBvdmVyIHRoZSBsYXp5IGRvZwo="
}

$ curl \
    --data @payload.json \
    http://localhost:8000/_/complete-challenge
```

```json
{
  "meta": {
    "kid": "eVTxhrEP4Ca60WM9S-ZmQhJ8urzAbjtqe3koQo8AxRs",
    "timestamp": "2022-08-09T21:28:18.760Z"
  },
  "data": {
    "session": "granfalloon-session_7ee4c581-567e-44a9-9cd5-73bcffb60fd6"
  }
}
```

## `GET /_/health`

A basic health check endpoint

### Example

```sh
$ curl --include http://localhost:8000/_/health
HTTP/1.1 200 OK
vary: Accept-Encoding
content-length: 0
date: Fri, 09 Sep 2022 17:08:26 GMT
```

# Contributing

0. Install `deno`
0. Clone the repository
0. `deno cache --reload --lock=lock.json src/deps.ts`
0. `deno test --allow-read --allow-env --allow-net`

# Motivation

> Note: This section was written before
> [fine-grained personal access tokens](https://github.blog/changelog/2022-10-18-introducing-fine-grained-personal-access-tokens/)
> were introduced.

Granfalloon was originally conceived to address practical issue related to the
use of GitHub personal access tokens. Due to GitHub not having true service
accounts, it is common for teams/organizations to create a bot account, then
use the bot's personal access tokens as a de facto service account key.

However, the scoping rules for GitHub personal access tokens are very limited:

- You may not limit a personal access token to a subset of the repositories to
  which the owner has access
- While personal access tokens do have the concept of scopes, they are quite
  coarse. For example, it is not possible to grant read access to private
  repositories without also granting write access

Combine these two drawbacks, and many valid use cases for a team-wide/org-wide
bot would dramatically undermine security.

Alternatively, it would be possible to satisfy these use cases securely by
creating many, single-purpose bot accounts. However, this approach can be both
clunky (due to managing many bot accounts) and expensive (due to each bot
reserving a full seat).

Conceptually, we wanted to create a reverse-proxy that "wraps" a
team-wide/org-wide personal access token. Applications that wanted to make use
of the token could then establish a "profile" with the proxy, specifying things
like authentication information as well as "allowable" endpoints.

When an application submits an invalid request (either due to invalid
authentication or an invalid request based on their profile), the proxy would
reject. Otherwise, the proxy would minimally modify the request to include the
personal access token, forward it to GitHub, then forward GitHub's response
back to the application.

To GitHub, these requests would seem like they are coming from a single
identity, but the proxy itself could maintain an audit logs for every
interaction with a pre-configured application.

It then occurred to us that very little of this use case is specific to GitHub.
The concept could be generalized to "wrap" any centralized secret, and the
profiles would just need to encode a list of REST endpoints.

Thus, Granfalloon was born!

# Inspiration

- https://github.com/google/magic-github-proxy
