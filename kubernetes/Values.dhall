let k = ./kubernetes.dhall
let types = ./types.dhall
in {
  Type = {
    ingress : Optional types.Ingress.Type,
    name : Optional Text,
    namespace : Optional Text,
    profiles : types.Profiles,
    proxyImage : Text,
    proxyResources : Optional k.ResourceRequirements.Type,
    proxyServiceAnnotations : Optional (List { mapKey : Text, mapValue : Text }),
    proxyServiceType : Text,
    proxyTag : Text,
    remote : Text,
    store : types.Store,
    token : Text,
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
    store = types.Store.InMemory,
  }
}
