let k = ./kubernetes.dhall

let T = {
  proxyResources : Optional k.ResourceRequirements.Type,
  name : Optional Text,
  namespace : Optional Text,
  image : Text,
  tag : Text,
  token : Text,
  proxyServiceType : Text,
  proxyServiceAnnotations : List { mapKey : Text, mapValue : Text },
  ingressHosts : List Text,
  ingressAnnotations : List { mapKey : Text, mapValue : Text },
  ingressClassName : Optional Text,
  ingressPath : Text,
  ingressPathType : Text,
  storeLimits : Optional (List { mapKey: Text, mapValue: Text }),
  profiles : List { mapKey : Text, mapValue : Text },
}

let default = {
  proxyResources = None k.ResourceRequirements.Type,
  name = None Text,
  namespace = None Text,
  image = "ghcr.io/colpal/granfalloon",
  tag = "0.0.9-deno1.24.1-distroless",
  proxyServiceType = "NodePort",
  ingressAnnotations = ([] : List { mapKey : Text, mapValue : Text }),
  ingressClassName = None Text,
  ingressPath = "/",
  ingressPathType = "Prefix",
  proxyServiceAnnotations = ([] : List { mapKey : Text, mapValue : Text }),
  storeLimits = None (List { mapKey : Text, mapValue : Text }),
}

in  { Type = T, default }
