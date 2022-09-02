let k = https://raw.githubusercontent.com/dhall-lang/dhall-kubernetes/master/package.dhall sha256:705f7bd1c157c5544143ab5917bdc3972fe941300ce4189a8ea89e6ddd9c1875

let Values = ./Values.dhall

in  \(v : Values.Type) ->
      let labels = {
        `app.kubernetes.io/name` = "granfalloon",
        `app.kubernetes.io/instance` = v.name,
      }

      let configMap = k.Resource.ConfigMap k.ConfigMap::{
        metadata = k.ObjectMeta::{
          name = Some "granfalloon-${v.name}-profiles",
        },
        data = Some v.profiles,
      }

      let proxyLabels = labels // { `app.kubernetes.io/component` = "proxy" }

      let proxyService = k.Resource.Service k.Service::{
        metadata = k.ObjectMeta::{
          name = Some "granfalloon-${v.name}-proxy",
        },
        spec = Some k.ServiceSpec::{
          selector = Some (toMap proxyLabels),
          ports = Some [k.ServicePort::{
            port = 80,
            targetPort = Some (k.NatOrString.Nat 8000),
          }],
        },
      }

      let proxy = k.Resource.Deployment k.Deployment::{
        metadata = k.ObjectMeta::{
          name = Some "granfalloon-${v.name}-proxy",
        },
        spec = Some k.DeploymentSpec::{
          selector = k.LabelSelector::{
            matchLabels = Some (toMap proxyLabels),
          },
          template = k.PodTemplateSpec::{
            metadata = Some k.ObjectMeta::{
              labels = Some (toMap proxyLabels)
            },
            spec = Some k.PodSpec::{
              volumes = Some [k.Volume::{
                name = "profiles",
                configMap = Some k.ConfigMapVolumeSource::{
                  name = Some "granfalloon-${v.name}-profiles",
                },
              }],
              containers = [k.Container::{
                name = "default",
                image = Some "${v.image}:${v.tag}",
                env = Some [k.EnvVar::{
                  name = "GRANFALLOON_TOKEN",
                  value = Some "banana",
                }],
                volumeMounts = Some [k.VolumeMount::{
                  name = "profiles",
                  mountPath = "/profiles",
                }],
                args = Some [
                  "--remote=https://api.github.com",
                  "--store=redis",
                  "--redis-hostname=granfalloon-${v.name}-store",
                  "--redis-port=6379",
                ],
              }],
            },
          },
        },
      }

      let storeLabels = labels // { `app.kubernetes.io/component` = "store" }

      let storeService = k.Resource.Service k.Service::{
        metadata = k.ObjectMeta::{
          name = Some "granfalloon-${v.name}-store",
        },
        spec = Some k.ServiceSpec::{
          selector = Some (toMap storeLabels),
          ports = Some [k.ServicePort::{
            port = 6379,
          }],
        },
      }

      let store = k.Resource.StatefulSet k.StatefulSet::{
        metadata = k.ObjectMeta::{
          name = Some "granfalloon-${v.name}-store"
        },
        spec = Some k.StatefulSetSpec::{
          serviceName = "granfalloon-${v.name}-store",
          selector = k.LabelSelector::{
            matchLabels = Some (toMap storeLabels),
          },
          template = k.PodTemplateSpec::{
            metadata = Some k.ObjectMeta::{
              labels = Some (toMap storeLabels),
            },
            spec = Some k.PodSpec::{
              containers = [k.Container::{
                name = "default",
                image = Some "redis:7.0.4-alpine3.16",
              }]
            },
          },
        },
      }

      in  [ configMap, proxy, proxyService, store, storeService ]
