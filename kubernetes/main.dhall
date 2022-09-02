let chart = ./chart.dhall

let Values = ./values.dhall

in  chart Values::{
  name = "github",
  ingressHosts = ["github.granfalloon.example.com"],
  profiles = toMap {
    `example.json` = ../test/profiles/example.json as Text,
  },
}
