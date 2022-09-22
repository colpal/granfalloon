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
      -- The name of an existing ConfigMap that was created from a directory of
      -- Granfalloon profiles
      < ConfigMapName : Text
      -- A Map of key-value pairs where each key is treated as a filename and
      -- each value is treated as the plaintext contents of a Granfalloon
      -- profile. This is used to "artificially" create a new ConfigMap as if
      -- from a directory of Granfalloon profiles
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
      -- Session information will be stored ephemerally within Granfalloon's
      -- runtime
      < InMemory

      -- Session information will be stored within a Redis instance that is
      -- bootstrapped by this package. Resource requests/limits and persistence
      -- may be configured
      | ManagedRedis : ManagedRedis.Type

      -- Session information will be stored within a Redis instance that is not
      -- bootstrapped by this package. A hostname and port must be provided
      | ExternalRedis : ExternalRedis.Type
      >

in  { Profiles, Ingress, ManagedRedis, ExternalRedis, Store }
