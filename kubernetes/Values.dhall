let T = {
  name : Text,
  image : Text,
  tag : Text,
  ingressHosts : List Text,
  ingressAnnotations : List { mapKey : Text, mapValue : Text },
  profiles : List { mapKey : Text, mapValue : Text },
}

let default = {
  image = "ghcr.io/colpal/granfalloon",
  tag = "0.0.8-deno1.24.1-distroless",
  ingressAnnotations = ([] : List { mapKey : Text, mapValue : Text }),
}

in  { Type = T, default }
