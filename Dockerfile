ARG DENO_VERSION
FROM denoland/deno:distroless-$DENO_VERSION
EXPOSE 8000
VOLUME ["/profiles"]
ENV GRANFALLOON_TOKEN=
COPY dist/granfalloon.js /
ENTRYPOINT ["deno", "run", "--no-remote", "--allow-read", "--allow-net", "--allow-env", "/granfalloon.js", "--profile-dir=/profiles"]
