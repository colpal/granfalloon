FROM denoland/deno:ubuntu-1.24.1 AS builder
COPY lock.json /lock.json
COPY src /src
RUN deno bundle --lock=lock.json src/mod.js -- /granfalloon.js

FROM denoland/deno:distroless-1.24.1
EXPOSE 8000
COPY --from=builder granfalloon.js /
ENTRYPOINT ["deno", "run", "--allow-read", "--allow-net", "--allow-env", "/granfalloon.js"]
