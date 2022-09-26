let Map = ./Map.Type.dhall
let k = ./kubernetes.dhall
let types = ./types.dhall
in {
  Type = {
    -- The Granfalloon profiles to provide to the proxy containers
    -- See the declaration in types.dhall for more information
    profiles : types.Profiles,

    -- The remote service to which Granfalloon will be proxying requests
    remote : Text,

    -- The long-lived token Granfalloon will inject into valid requests
    token : Text,

    -- Configuration for an Ingress to front Granfalloon's Service
    ingress : Optional types.Ingress.Type,

    -- A name to prefix/label all resources declared by this package
    name : Optional Text,

    -- The namespace in which all resources should be declared
    namespace : Optional Text,

    -- The OCI image to use for the Granfalloon container
    proxyImage : Text,

    -- Requests/Limits to set on the Granfalloon container
    proxyResources : Optional k.ResourceRequirements.Type,

    -- Annotations to set on Granfalloon's Service
    proxyServiceAnnotations : Optional (Map Text Text),

    -- The type to set on Granfalloon's Service
    proxyServiceType : Text,

    -- The OCI image tag to use for the Granfalloon container
    proxyTag : Text,

    -- The method Granfalloon will use to store session information
    -- See the declaration in types.dhall for more information
    store : types.Store,
  },
  default = {
    -- The default is to not declare an Ingress
    ingress = None types.Ingress.Type,

    -- The default is to name/label resources generically
    name = None Text,

    -- The default is to declare resources in the current namespace
    namespace = None Text,

    -- The default is to use the official Granfalloon OCI image
    proxyImage = "ghcr.io/colpal/granfalloon",

    -- The default is to not request/limit Granfalloon resources
    proxyResources = None k.ResourceRequirements.Type,

    -- The default is to not declare any Service annotations
    proxyServiceAnnotations = None (Map Text Text),

    -- The default is to declare the Service as a NodePort
    proxyServiceType = "NodePort",

    -- The default tag to use with the official Granfalloon image
    proxyTag = "0.0.13-deno1.24.1-distroless",

    -- The default is to declare and connect to a non-resource constrained,
    -- non-persistent Redis instance in the same namespace
    store = types.Store.ManagedRedis types.ManagedRedis::{=},
  },
}
