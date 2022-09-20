let k = ./kubernetes.dhall
let Profiles = ./Profiles.dhall
let Ingress = ./Ingress.dhall

let T = {
  ingress : Optional Ingress.Type,
  name : Optional Text,
  namespace : Optional Text,
  profiles : Profiles,
  proxyImage : Text,
  proxyResources : Optional k.ResourceRequirements.Type,
  proxyServiceAnnotations : Optional (List { mapKey : Text, mapValue : Text }),
  proxyServiceType : Text,
  proxyTag : Text,
  remote : Text,
  storePersistence : Optional k.PersistentVolumeClaimSpec.Type,
  storeResources : Optional k.ResourceRequirements.Type,
  token : Text,
}

let default = {
  ingress = None Ingress.Type,
  name = None Text,
  namespace = None Text,
  proxyImage = "ghcr.io/colpal/granfalloon",
  proxyResources = None k.ResourceRequirements.Type,
  proxyServiceAnnotations = None (List { mapKey : Text, mapValue : Text }),
  proxyServiceType = "NodePort",
  proxyTag = "0.0.9-deno1.24.1-distroless",
  storePersistence = None k.PersistentVolumeClaimSpec.Type,
  storeResources = None k.ResourceRequirements.Type,
}

in  { Type = T, default }
