FROM denoland/deno:ubuntu-1.24.1 AS builder
COPY lock.json /lock.json
COPY src/deps.ts /src/deps.ts
RUN deno cache --lock=lock.json --reload src/deps.ts
COPY src /src
RUN deno bundle --lock=lock.json src/mod.js -- /granfalloon.js

FROM denoland/deno:distroless-1.24.1
EXPOSE 8000
ENV GRANFALLOON_TOKEN=
COPY --from=builder granfalloon.js /
ENTRYPOINT ["deno", "run", "--no-remote", "--allow-read", "--allow-net", "--allow-env", "/granfalloon.js"]
