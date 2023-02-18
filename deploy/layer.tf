data "archive_file" "function_layer_zip" {
  type = "zip"

  source_dir  = "${path.module}/../src/function-layer"
  output_path = "${path.module}/../dist/function-layer.zip"
}

resource "aws_lambda_layer_version" "function_layer" {
  filename    = "../dist/function-layer.zip"
  layer_name  = "${var.function_name}-layer"
  description = "Wkhtmltopdf + nunito & dejavu"

  compatible_runtimes = ["nodejs18.x"]
}
