let T = {
  name : Text,
  image : Text,
  tag : Text,
  ingress : {
    hosts : List Text,
  },
  profiles : List { mapKey : Text, mapValue : Text },
}

let default = {
  image = "ghcr.io/colpal/granfalloon",
  tag = "0.0.8-deno1.24.1-distroless",
}

in  { Type = T, default }
