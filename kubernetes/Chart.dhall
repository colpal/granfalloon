let k = https://raw.githubusercontent.com/dhall-lang/dhall-kubernetes/master/1.22/package.dhall sha256:53c03eb6a2cf118b3608f81253293993308a11f46b4463a18e376d343163bb21

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

      let proxyName = "granfalloon-${v.name}-proxy"

      let secret = k.Resource.Secret k.Secret::{
        metadata = k.ObjectMeta::{
          name = Some proxyName,
        },
        stringData = Some (toMap {
          token = v.token,
        }),
      }

      let proxyService = k.Resource.Service k.Service::{
        metadata = k.ObjectMeta::{
          name = Some proxyName
        },
        spec = Some k.ServiceSpec::{
          selector = Some (toMap proxyLabels),
          ports = Some [k.ServicePort::{
            port = 80,
            targetPort = Some (k.NatOrString.Nat 8000),
          }],
        },
      }

      let proxyIngress = k.Resource.Ingress k.Ingress::{
        metadata = k.ObjectMeta::{
          annotations = Some v.ingressAnnotations,
          name = Some proxyName
        },
        spec = Some k.IngressSpec::{
          defaultBackend = Some k.IngressBackend::{
            service = Some k.IngressServiceBackend::{
              name = proxyName,
            },
          },
          tls = Some [k.IngressTLS::{
            secretName = Some proxyName,
            hosts = Some v.ingressHosts,
          }],
        },
      }

      let proxy = k.Resource.Deployment k.Deployment::{
        metadata = k.ObjectMeta::{
          name = Some proxyName
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

      in  [ secret, configMap, proxy, proxyService, proxyIngress, store, storeService ]
