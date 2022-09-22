let Map = ./Map.Type.dhall
let k = ./kubernetes.dhall
let types = ./types.dhall
in {
  Type = {
    -- The Granfalloon profiles to provide to the proxy containers
    --     types.Profiles.ConfigMapName Text:
    --         The name of an existing ConfigMap that was created from a
    --         directory of Granfalloon profiles
    --     types.Profiles.Files (Map Text Text):
    --         A Map of key-value pairs where each key is treated as a filename
    --         and each value is treated as the plaintext contents of a
    --         Granfalloon profile. This is used to "artificially" create a
    --         new ConfigMap as if from a directory of Granfalloon profiles
    profiles : types.Profiles,

    -- The remote service to which Granfalloon will be proxying requests
    remote : Text,

    -- The long-lived token Granfalloon will inject into valid requests
    token : Text,

    -- Configuration for an Ingress to front Granfalloon's Service
    ingress : Optional types.Ingress.Type,

    -- A name to prefix/label all resources declared by this package
    name : Optional Text,

    -- The namespace in which all resources should be declared
    namespace : Optional Text,

    -- The OCI image to use for the Granfalloon container
    proxyImage : Text,

    -- Requests/Limits to set on the Granfalloon container
    proxyResources : Optional k.ResourceRequirements.Type,

    -- Annotations to set on Granfalloon's Service
    proxyServiceAnnotations : Optional (Map Text Text),

    -- The type to set on Granfalloon's Service
    proxyServiceType : Text,

    -- The OCI image tag to use for the Granfalloon container
    proxyTag : Text,

    -- The method Granfalloon will use to store session information
    --     types.Store.InMemory:
    --         Session information will be stored ephemerally within
    --         Granfalloon's runtime
    --     types.Store.ExternalRedis types.ExternalRedis:
    --         Session information will be stored within a Redis instance that
    --         is not bootstrapped by this package. A hostname and port must be
    --         provided
    --     types.Store.ManagedRedis types.ManagedRedis:
    --         Session information will be stored within a Redis instance that
    --         is bootstrapped by this package. Resource requests/limits and
    --         persistence may be configured
    store : types.Store,
  },
  default = {
    -- The default is to not declare an Ingress
    ingress = None types.Ingress.Type,

    -- The default is to name/label resources generically
    name = None Text,

    -- The default is to declare resources in the current namespace
    namespace = None Text,

    -- The default is to use the official Granfalloon OCI image
    proxyImage = "ghcr.io/colpal/granfalloon",

    -- The default is to not request/limit Granfalloon resources
    proxyResources = None k.ResourceRequirements.Type,

    -- The default is to not declare any Service annotations
    proxyServiceAnnotations = None (Map Text Text),

    -- The default is to declare the Service as a NodePort
    proxyServiceType = "NodePort",

    -- The default tag to use with the official Granfalloon image
    proxyTag = "0.0.9-deno1.24.1-distroless",

    -- The default is to declare and connect to a non-resource constrained,
    -- non-persistent Redis instance in the same namespace
    store = types.Store.ManagedRedis types.ManagedRedis::{=},
  },
}
