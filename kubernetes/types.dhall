let k = ./kubernetes.dhall

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

let ManagedRedis =
      { Type =
          { persistence : Optional k.PersistentVolumeClaimSpec.Type
          , resources : Optional k.ResourceRequirements.Type
          }
      , default =
        { persistence = None k.PersistentVolumeClaimSpec.Type
        , resources = None k.ResourceRequirements.Type
        }
      }

let ExternalRedis =
      { Type = { hostname : Text, port : Natural }, default.port = 6379 }

let Store = < ManagedRedis : ManagedRedis.Type | ExternalRedis : ExternalRedis.Type >

in  { Profiles, Ingress, ManagedRedis, ExternalRedis, Store }
