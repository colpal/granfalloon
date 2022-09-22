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
    remote : Text,
    token : Text,
    ingress : Optional types.Ingress.Type,
    name : Optional Text,
    namespace : Optional Text,
    proxyImage : Text,
    proxyResources : Optional k.ResourceRequirements.Type,
    proxyServiceAnnotations : Optional (List { mapKey : Text, mapValue : Text }),
    proxyServiceType : Text,
    proxyTag : Text,
    store : types.Store,
  },
  default = {
    ingress = None types.Ingress.Type,
    name = None Text,
    namespace = None Text,
    proxyImage = "ghcr.io/colpal/granfalloon",
    proxyResources = None k.ResourceRequirements.Type,
    proxyServiceAnnotations = None (List { mapKey : Text, mapValue : Text }),
    proxyServiceType = "NodePort",
    proxyTag = "0.0.9-deno1.24.1-distroless",
    store = types.Store.ManagedRedis types.ManagedRedis::{=},
  },
}
