let List/map = https://raw.githubusercontent.com/dhall-lang/dhall-lang/v21.1.0/Prelude/List/map.dhall sha256:dd845ffb4568d40327f2a817eb42d1c6138b929ca758d50bc33112ef3c885680
let List/unpackOptionals = https://raw.githubusercontent.com/dhall-lang/dhall-lang/v21.1.0/Prelude/List/unpackOptionals.dhall sha256:0cbaa920f429cf7fc3907f8a9143203fe948883913560e6e1043223e6b3d05e4
let k = ./kubernetes.dhall

let types = ./types.dhall
let Values = ./Values.dhall

in \(v : Values.Type) ->
    let predefinedLabels = toMap {
      `app.kubernetes.io/name` = "granfalloon",
    }

    let labels = merge {
      Some = \(t : Text) ->
          predefinedLabels # toMap {
            `app.kubernetes.io/instance` = t,
          },
      None = predefinedLabels,
    } v.name

    let namePrefix = merge {
      Some = \(t : Text) -> "${t}-",
      None = "",
    } v.name

    let configMapName = merge {
      ConfigMapName = \(t : Text) -> t,
      Files = \(_ : List { mapKey: Text, mapValue : Text }) ->
          "${namePrefix}profiles",
    } v.profiles

    let configMap = merge {
      ConfigMapName = \(_ : Text) -> None k.Resource,
      Files = \(m : List { mapKey : Text, mapValue : Text }) ->
          Some (k.Resource.ConfigMap k.ConfigMap::{
            metadata = k.ObjectMeta::{
              name = Some configMapName,
              namespace = v.namespace,
            },
            data = Some m,
          })
    } v.profiles

    let proxyLabels = labels # toMap {
      `app.kubernetes.io/component` = "proxy",
    }

    let proxyName = "${namePrefix}proxy"

    let secret = k.Resource.Secret k.Secret::{
      metadata = k.ObjectMeta::{
        name = Some proxyName,
        namespace = v.namespace,
      },
      stringData = Some (toMap {
        token = v.token,
      }),
    }

    let proxyService = k.Resource.Service k.Service::{
      metadata = k.ObjectMeta::{
        annotations = v.proxyServiceAnnotations,
        namespace = v.namespace,
        name = Some proxyName
      },
      spec = Some k.ServiceSpec::{
        type = Some v.proxyServiceType,
        selector = Some proxyLabels,
        ports = Some [k.ServicePort::{
          port = 80,
          targetPort = Some (k.NatOrString.Nat 8000),
        }],
      },
    }

    let ingress = merge {
      None = None k.Resource,
      Some = \(i : types.Ingress.Type) ->
          let hostToRule = \(t : Text) ->
              k.IngressRule::{
                host = Some t,
                http = Some k.HTTPIngressRuleValue::{
                  paths = [k.HTTPIngressPath::{
                    path = Some i.path,
                    pathType = i.pathType,
                    backend = k.IngressBackend::{
                      service = Some k.IngressServiceBackend::{
                        name = proxyName,
                        port = Some k.ServiceBackendPort::{
                          number = Some 80,
                        },
                      },
                    },
                  }],
                },
              }
          let rules = List/map Text k.IngressRule.Type hostToRule i.hosts
          in Some (k.Resource.Ingress k.Ingress::{
            metadata = k.ObjectMeta::{
              annotations = i.annotations,
              namespace = v.namespace,
              name = Some proxyName
            },
            spec = Some k.IngressSpec::{
              ingressClassName = i.className,
              tls = Some [k.IngressTLS::{
                secretName = Some proxyName,
                hosts = Some i.hosts,
              }],
              rules = Some rules,
            },
          })
    } v.ingress

    let storeArguments = merge {
      InMemory = ["--store=in-memory"],
      ManagedRedis = \(_ : types.ManagedRedis.Type) ->
          [
            "--store=redis",
            "--redis-hostname",
            "${namePrefix}store",
            "--redis-port=6379",
          ],
      ExternalRedis = \(er : types.ExternalRedis.Type) ->
          [
            "--store=redis",
            "--redis-hostname",
            er.hostname,
            "--redis-port",
            Natural/show er.port
          ],
    } v.store

    let proxy = k.Resource.Deployment k.Deployment::{
      metadata = k.ObjectMeta::{
        namespace = v.namespace,
        name = Some proxyName
      },
      spec = Some k.DeploymentSpec::{
        selector = k.LabelSelector::{
          matchLabels = Some proxyLabels,
        },
        template = k.PodTemplateSpec::{
          metadata = Some k.ObjectMeta::{
            labels = Some proxyLabels,
          },
          spec = Some k.PodSpec::{
            volumes = Some [k.Volume::{
              name = "profiles",
              configMap = Some k.ConfigMapVolumeSource::{
                name = Some configMapName,
                optional = Some False,
              },
            }],
            containers = [k.Container::{
              name = "default",
              image = Some "${v.proxyImage}:${v.proxyTag}",
              env = Some [k.EnvVar::{
                name = "GRANFALLOON_TOKEN",
                valueFrom = Some k.EnvVarSource::{
                  secretKeyRef = Some k.SecretKeySelector::{
                    name = Some proxyName,
                    key = "token",
                    optional = Some False,
                  },
                },
              }],
              volumeMounts = Some [k.VolumeMount::{
                name = "profiles",
                mountPath = "/profiles",
              }],
              livenessProbe = Some k.Probe::{
                httpGet = Some k.HTTPGetAction::{
                  path = Some "/_/health",
                  port = k.NatOrString.Nat 8000,
                },
              },
              resources = v.proxyResources,
              args = Some ([
                "--remote=${v.remote}",
              ] # storeArguments),
            }],
          },
        },
      },
    }

    let storeLabels = labels # toMap {
      `app.kubernetes.io/component` = "store",
    }

    let storeService = merge {
      InMemory = None k.Resource,
      ExternalRedis = \(_ : types.ExternalRedis.Type) -> None k.Resource,
      ManagedRedis = \(_ : types.ManagedRedis.Type) ->
          Some (k.Resource.Service k.Service::{
            metadata = k.ObjectMeta::{
              namespace = v.namespace,
              name = Some "${namePrefix}store",
            },
            spec = Some k.ServiceSpec::{
              selector = Some storeLabels,
              ports = Some [k.ServicePort::{
                port = 6379,
              }],
            },
          }),
    } v.store

    let store = merge {
      InMemory = None k.Resource,
      ExternalRedis = \(_ : types.ExternalRedis.Type) -> None k.Resource,
      ManagedRedis = \(mr : types.ManagedRedis.Type) ->
          let volumeClaimTemplates = merge {
            None = None (List k.PersistentVolumeClaim.Type),
            Some = \(s : k.PersistentVolumeClaimSpec.Type) ->
                Some [k.PersistentVolumeClaim::{
                  metadata = k.ObjectMeta::{
                    name = Some "cache",
                  },
                  spec = mr.persistence,
                }],
          } mr.persistence
          let args = merge {
            None = None (List Text),
            Some = \(_ : k.PersistentVolumeClaimSpec.Type) ->
                Some ["redis-server", "--save", "60", "1"],
          } mr.persistence
          let volumeMounts = merge {
            None = None (List k.VolumeMount.Type),
            Some = \(_ : k.PersistentVolumeClaimSpec.Type) ->
                Some [k.VolumeMount::{
                  name = "cache",
                  mountPath = "/data",
                }],
          } mr.persistence
          in Some (k.Resource.StatefulSet k.StatefulSet::{
            metadata = k.ObjectMeta::{
              namespace = v.namespace,
              name = Some "${namePrefix}store"
            },
            spec = Some k.StatefulSetSpec::{
              serviceName = "${namePrefix}store",
              selector = k.LabelSelector::{
                matchLabels = Some storeLabels,
              },
              volumeClaimTemplates = volumeClaimTemplates,
              template = k.PodTemplateSpec::{
                metadata = Some k.ObjectMeta::{
                  labels = Some storeLabels,
                },
                spec = Some k.PodSpec::{
                  containers = [k.Container::{
                    name = "default",
                    image = Some "redis:7.0.4-alpine3.16",
                    args = args,
                    resources = mr.resources,
                    volumeMounts = volumeMounts,
                  }],
                },
              },
            },
          }),
    } v.store

    in [
      secret,
      proxy,
      proxyService,
    ] # List/unpackOptionals k.Resource [
      store,
      storeService,
      configMap,
      ingress,
    ]
