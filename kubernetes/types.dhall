let Map = ./Map.Type.Dhall

let k = ./kubernetes.dhall

let Ingress = {
  Type = {
    -- Annotations to apply to the Ingress
    annotations : Optional (Map Text Text),

    -- Which class of Ingress to declare
    className : Optional Text,

    -- The hosts to which the Ingress should be bound
    hosts : List Text,

    -- The path to which requests should be routed
    path : Text,

    -- The type of path declaration to use
    pathType : Text
  },
  default = {
    -- The default is to not declare any Ingress annotations
    annotations = None (Map Text Text),

    -- The default is to declare the default Ingress class for the cluster
    className = None Text,

    -- The default is to route all traffic to the Granfalloon container
    path = "/",
    pathType = "Prefix"
  },
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

let ManagedRedis = {
  Type = {
    -- Configuration for the persistent volume to be used by Redis
    persistence : Optional k.PersistentVolumeClaimSpec.Type,

    -- Resource requests/limits to set on the Redis instance
    resources : Optional k.ResourceRequirements.Type,
  },
  default = {
    -- The default is to not declare a persistent volume
    persistence = None k.PersistentVolumeClaimSpec.Type,

    -- The default is to not request/limit resources
    resources = None k.ResourceRequirements.Type,
  },
}

let ExternalRedis = {
  Type = {
    -- The hostname of the external Redis instance
    hostname : Text,
    
    -- The listening port of the external Redis instance
    port : Natural,
  },
  
  -- The default Redis port
  default.port = 6379,
}

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
