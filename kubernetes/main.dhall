let chart = ./chart.dhall

let Values = ./values.dhall

in  chart Values::{
  name = "github"
}
