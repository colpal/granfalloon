let Ingress =
      { Type =
          { annotations : Optional (List { mapKey : Text, mapValue : Text })
          , className : Optional Text
          , hosts : List Text
          , path : Text
          , pathType : Text
          }
      , default =
        { annotations = None (List { mapKey : Text, mapValue : Text })
        , className = None Text
        , path = "/"
        , pathType = "Prefix"
        }
      }

let Profiles =
      < ConfigMapName : Text | Files : List { mapKey : Text, mapValue : Text } >

in  { Profiles, Ingress }
