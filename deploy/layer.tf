data "archive_file" "lambda_layer_zip" {
  type = "zip"

  source_dir  = "${path.module}/../src/lambda-layer"
  output_path = "${path.module}/../dist/lambda-layer.zip"
}

resource "aws_lambda_layer_version" "wkhtml_layer" {
  filename    = "../dist/lambda-layer.zip"
  layer_name  = "wkhtml-layer"
  description = "Wkhtmltopdf + nunito & dejavu"

  compatible_runtimes = ["nodejs18.x"]
}
