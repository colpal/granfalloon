let k = ./kubernetes.dhall
let Profiles = ./Profiles.dhall

let T = {
  storePersistence : Optional k.PersistentVolumeClaimSpec.Type,
  proxyResources : Optional k.ResourceRequirements.Type,
  storeResources : Optional k.ResourceRequirements.Type,
  name : Optional Text,
  namespace : Optional Text,
  proxyImage : Text,
  proxyTag : Text,
  token : Text,
  proxyServiceType : Text,
  proxyServiceAnnotations : Optional (List { mapKey : Text, mapValue : Text }),
  ingressHosts : List Text,
  ingressAnnotations : Optional (List { mapKey : Text, mapValue : Text }),
  ingressClassName : Optional Text,
  ingressPath : Text,
  ingressPathType : Text,
  profiles : Profiles,
  remote : Text,
}

let default = {
  storePersistence = None k.PersistentVolumeClaimSpec.Type,
  proxyResources = None k.ResourceRequirements.Type,
  storeResources = None k.ResourceRequirements.Type,
  name = None Text,
  namespace = None Text,
  proxyImage = "ghcr.io/colpal/granfalloon",
  proxyTag = "0.0.9-deno1.24.1-distroless",
  proxyServiceType = "NodePort",
  ingressAnnotations = None (List { mapKey : Text, mapValue : Text }),
  ingressClassName = None Text,
  ingressPath = "/",
  ingressPathType = "Prefix",
  proxyServiceAnnotations = None (List { mapKey : Text, mapValue : Text }),
}

in  { Type = T, default }
