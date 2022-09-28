# Kubernetes

The are two deployment options for Granfallon on Kubernetes:

- manual deployment
- deployment via a provided [Dhall](https://dhall-lang.org/) package

## Dhall

The provided [`package.dhall`](./package.dhall) file exports a `chart` function
along with all associated types necessary to call it. It is possible to create
your own Dhall file and import [`package.dhall`](./package.dhall) over HTTPS (it
is strongly recommended that you use
[Dhall's freeze functionality to validate imports](
https://docs.dhall-lang.org/discussions/Safety-guarantees.html#code-injection)).
When called, the `chart` function will return a list of [`dhall-kubernetes`](
https://github.com/dhall-lang/dhall-kubernetes) resources. These resources may
be exported to YAML using the [`dhall-to-yaml-ng`](
https://github.com/dhall-lang/dhall-haskell/tree/master/dhall-yaml) command-line
application. This YAML can be utilized by `kubectl` to apply resources.

Below are a few examples of configuring and applying the Dhall-based
deployment. For more information on the possible options that can be passed to
the `chart` function, see the [`Values.dhall`](./Values.dhall) file. It defines
all possible options as well as their default values, and is heavily annotated.

### Minimal Example

```dhall
-- package.dhall
let package =
      https://raw.githubusercontent.com/colpal/granfalloon/v0.0.15/kubernetes/package.dhall
        sha256:0000000000000000000000000000000000000000000000000000000000000000

in package.chart package.Values::{
  remote = "https://example.com",
  token = env:GRANFALLOON_TOKEN as Text,
  profiles = package.Profiles.ConfigMapName "my-config-map",
}
```

```sh
$ kubectl create configmap my-config-map --from-file=profiles/
$ dhall-to-yaml-ng --file package.dhall --documents | kubectl apply -f -
```

### Full Example

```dhall
-- package.dhall
let package =
      https://raw.githubusercontent.com/colpal/granfalloon/v0.0.15/kubernetes/package.dhall
        sha256:0000000000000000000000000000000000000000000000000000000000000000

in package.chart package.Values::{
  remote = "https://api.github.com",
  token = env:GRANFALLOON_TOKEN as Text,
  name = Some "github",
  namespace = Some "granfalloon-github",
  proxyImage = "custom-granfalloon-image",
  proxyServiceType = "ClusterIP",
  proxyTag = "v1.0.0",

  profiles = package.Profiles.Files (toMap {
    `example.json` : ./profiles/example.json as Text,
  }),

  ingress = Some package.Ingress::{
    annotations = Some (toMap {
      `cert-manager.io/cluster-issuer` = "cluster-issuer",
    }),
    className = Some "gce-internal",
    hosts = [ "https://granfalloon.example.com" ],
    path = "/*",
    pathType = "ImplementationSpecific",
  },

  proxyResources = package.kubernetes.ResourceRequirements::{
    requests = Some (toMap { cpu = "1", memory = "1G" }),
    limits = Some (toMap { cpu = "2", memory = "2G" }),
  },

  proxyServiceAnnotations = Some (toMap {
    `cloud.google.com/neg` = "{ \"ingress\": true }",
  }),

  store = package.Store.ManagedRedis package.ManagedRedis::{
    persistence = Some package.kubernetes.PersistentVolumeClaimSpec::{
      accessModes = Some [ "ReadWriteOnce" ],
      resources = Some package.kubernetes.ResourceRequirements::{
        requests = Some (toMap { storage = "1G" })
      },
    },
    resources = Some package.kubernetes.ResourceRequirements::{
      requests = Some (toMap { cpu = "250m", memory = "512M" }),
      limits = Some (toMap { cpu = "500m", memory = "1G" }),
    },
  },
}
```

```sh
$ dhall-to-yaml-ng --file package.dhall --documents | kubectl apply -f -
```

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
