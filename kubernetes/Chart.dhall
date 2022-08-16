let k = https://raw.githubusercontent.com/dhall-lang/dhall-kubernetes/master/package.dhall
let Values = ./values.dhall

in  \(v : Values.Type) ->
      let labels = {
        `app.kubernetes.io/name` = "granfalloon",
        `app.kubernetes.io/instance` = v.name,
      }

      let proxy = k.Deployment::{
        metadata = k.ObjectMeta::{
          name = Some "granfalloon-${v.name}-proxy",
          labels = Some (toMap (labels // {
            `app.kubernetes.io/component` = "proxy",
          })),
        },
        spec = Some k.DeploymentSpec::{
          selector = k.LabelSelector::{
            matchLabels = Some (toMap (labels // {
              `app.kubernetes.io/component` = "proxy",
            })),
          },
          template = k.PodTemplateSpec::{
            spec = Some k.PodSpec::{
              containers = [k.Container::{
                name = "default",
                image = Some "${v.image}:${v.tag}",
                ports = Some [k.ContainerPort::{
                  containerPort = 8000
                }],
              }],
            },
          },
        },
      }

      in  [ proxy ]
