# Kubernetes

## Manual

The official Granfalloon OCI image is hosted using [GitHub Packages](
https://github.com/colpal/granfalloon/pkgs/container/granfalloon). Profiles can
be mounted into containers using the `/profiles` volume. Container arguments
are passed directly to the Granfalloon executables command-line arguments, and
can be used to configure store options.

With this in mind, a minimal Granfalloon deployment on Kubernetes can be created
with the following resources:

- a `Deployment` to manage the Granfalloon container
- a `Service` to route traffic to the `Deployment`
- a `Secret` containing the `GRANFALLOON_TOKEN` to mount to the `Deployment`
- a `ConfigMap` containing one or more profiles to mount to the `Deployment`

However, a deployment this simple would lack TLS, only support a single Pod
replica, and would lack persistence in the event of the Pod crashing/shuffling.
It is therefore recommended that:

- an `Ingress` (or similar proxy) be placed in front of the `Service` to handle
  TLS termination
- the `Deployment` is configured to connect to a Redis instance (either within
  Kubernetes or externally) with persistence enabled
