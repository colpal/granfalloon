# Granfalloon

> "The one who is many"
>
> \- _Castlevania_

Granfalloon is a reverse-proxy that allows secure, distributed usage of a
typically centralized secret

## Usage

```sh
$ cat .env
export GRANFALLOON_TOKEN=my-token
$ source .env
$ ./granfalloon --target=https://api.github.com --profiles-dir=profiles/
```

## Motivation

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

## Inspiration

- https://github.com/google/magic-github-proxy
