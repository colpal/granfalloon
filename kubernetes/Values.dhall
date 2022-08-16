let T = {
  name : Text,
  image : Text,
  tag : Text,
}

let default = {
  image = "ghcr.io/colpal/granfalloon",
  tag = "0.0.7-deno1.24.1-distroless",
}

in  { Type = T, default }
