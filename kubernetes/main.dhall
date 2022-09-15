let package = ./package.dhall
let chart = package.chart
let Values = package.Values
let k = package.kubernetes

in  chart Values::{
  name = "github",
  token = env:GRANFALLOON_TOKEN as Text,
  ingressHosts = ["github.granfalloon.example.com"],
  profiles = toMap {
    `example.json` = ../test/profiles/example.json as Text,
  },
}
