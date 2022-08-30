let k = https://raw.githubusercontent.com/dhall-lang/dhall-kubernetes/master/package.dhall sha256:0d7e7c321164921d742e2b23c5cc79e59ff02bd77106b799322bb14f12c29f91

let Values = ./Values.dhall

in  \(v : Values.Type) ->
      let labels = {
        `app.kubernetes.io/name` = "granfalloon",
        `app.kubernetes.io/instance` = v.name,
      }

      let proxyLabels = labels // { `app.kubernetes.io/component` = "proxy" }

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
              containers = [k.Container::{
                name = "default",
                image = Some "${v.image}:${v.tag}",
                env = Some [k.EnvVar::{
                  name = "GRANFALLOON_TOKEN",
                  value = Some "banana",
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

      in  [ proxy, store, storeService ]
