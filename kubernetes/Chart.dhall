let Values = ./values.dhall

in  \(v : Values.Type) ->
      let labels = {
        `app.kubernetes.io/name` = "granfalloon",
        `app.kubernetes.io/instance` = v.name,
      }

      let proxy = {
        kind = "Deployment",
        apiVersion = "apps/v1",
        metadata = {
          name = "granfalloon-${v.name}-proxy",
          labels,
          labels.`app.kubernetes.io/component` = "proxy",
        },
        spec.selector.matchLabels = labels,
        spec.selector.matchLabels.`app.kubernetes.io/component` = "proxy",
        spec.template = {
          metadata.labels = labels,
          metadata.labels.`app.kubernetes.io/component` = "proxy",
          spec.containers = [{
            name = "default",
            image = "${v.image}:${v.tag}",
            ports = [ { containerPort = 8000 } ],
          }],
        },
      }

      let store = {
        kind = "StatefulSet",
        apiVersion = "apps/v1",
        metadata = {
          name = "granfalloon-${v.name}-store",
          labels,
          labels.`app.kubernetes.io/component` = "store",
        },
        spec.selector.matchLabels = labels,
        spec.selector.matchLabels.`app.kubernetes.io/component` = "store",
        spec.template = {
          metadata.labels = labels,
          metadata.labels.`app.kubernetes.io/component` = "store",
          spec.containers = [{
            name = "default",
            image = "redis:alpine"
          }]
        }
      }

      in  [ proxy, store ]
