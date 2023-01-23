resource "aws_lambda_layer_version" "wkhtml_layer" {
  filename    = "wkhtml-layer.zip"
  layer_name  = "wkhtml-layer"
  description = "Wkhtmltopdf + nunito & dejavu"

  compatible_runtimes = ["nodejs18.x"]
}
