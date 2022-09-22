let Map = ./Map.Type.Dhall

let k = ./kubernetes.dhall

let Ingress =
      { Type =
          { annotations : Optional (Map Text Text)
          , className : Optional Text
          , hosts : List Text
          , path : Text
          , pathType : Text
          }
      , default =
        { annotations = None (Map Text Text)
        , className = None Text
        , path = "/"
        , pathType = "Prefix"
        }
      }

let Profiles =
      < ConfigMapName : Text
      | Files : Map Text Text >

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

let Store =
      < InMemory
      | ManagedRedis : ManagedRedis.Type
      | ExternalRedis : ExternalRedis.Type
      >

in  { Profiles, Ingress, ManagedRedis, ExternalRedis, Store }
