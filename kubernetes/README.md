# Kubernetes

The are two deployment options for Granfallon on Kubernetes: manual, and a
provided [Dhall](https://dhall-lang.org/) package

## Dhall

The provided [package.dhall](./package.dhall) file exports a `chart` function
along with all associated types necessary to call it. It is possible to create
your own Dhall file, and import package.dhall over HTTPS. When called, it will
return a list of [dhall-kubernetes](
https://github.com/dhall-lang/dhall-kubernetes) resources. These resources may
be exported to YAML using the [dhall-to-yaml-ng](
https://github.com/dhall-lang/dhall-haskell/tree/master/dhall-yaml)
application. This YAML can be utilized by `kubectl`.

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
