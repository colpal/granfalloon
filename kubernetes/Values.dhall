let k = ./kubernetes.dhall

let T = {
  storePersistence : Optional k.PersistentVolumeClaimSpec.Type,
  proxyResources : Optional k.ResourceRequirements.Type,
  storeResources : Optional k.ResourceRequirements.Type,
  name : Optional Text,
  namespace : Optional Text,
  image : Text,
  tag : Text,
  token : Text,
  proxyServiceType : Text,
  proxyServiceAnnotations : Optional (List { mapKey : Text, mapValue : Text }),
  ingressHosts : List Text,
  ingressAnnotations : Optional (List { mapKey : Text, mapValue : Text }),
  ingressClassName : Optional Text,
  ingressPath : Text,
  ingressPathType : Text,
  profiles : Optional (List { mapKey : Text, mapValue : Text }),
  remote : Text,
}

let default = {
  storePersistence = None k.PersistentVolumeClaimSpec.Type,
  proxyResources = None k.ResourceRequirements.Type,
  storeResources = None k.ResourceRequirements.Type,
  name = None Text,
  namespace = None Text,
  image = "ghcr.io/colpal/granfalloon",
  tag = "0.0.9-deno1.24.1-distroless",
  proxyServiceType = "NodePort",
  ingressAnnotations = None (List { mapKey : Text, mapValue : Text }),
  ingressClassName = None Text,
  ingressPath = "/",
  ingressPathType = "Prefix",
  profiles = None (List { mapKey : Text, mapValue : Text }),
  proxyServiceAnnotations = None (List { mapKey : Text, mapValue : Text }),
}

in  { Type = T, default }
