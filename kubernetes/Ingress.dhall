{
  Type = {
    annotations : Optional (List { mapKey: Text, mapValue : Text}),
    className : Optional Text,
    hosts : List Text,
    path : Text,
    pathType : Text,
  },
  default = {
    annotations = None (List { mapKey : Text, mapValue : Text }),
    className = None Text,
    path = "/",
    pathType = "Prefix",
  },
}
