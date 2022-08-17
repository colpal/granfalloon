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
              }],
            },
          },
        },
      }

      in  [ proxy ]
