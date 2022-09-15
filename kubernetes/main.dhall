let chart = ./chart.dhall

let Values = ./Values.dhall

in  chart Values::{
  name = "github",
  token = env:GRANFALLOON_TOKEN as Text,
  ingressHosts = ["github.granfalloon.example.com"],
  profiles = toMap {
    `example.json` = ../test/profiles/example.json as Text,
  },
}
