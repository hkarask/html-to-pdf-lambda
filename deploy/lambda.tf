data "archive_file" "lambda_hello_world_zip" {
  type = "zip"

  source_dir  = "${path.module}/../src"
  output_path = "${path.module}/dist.zip"
}

resource "aws_lambda_function" "hello_world" {
  function_name    = "HelloWorld"
  runtime          = "nodejs18.x"
  handler          = "index.handler"
  timeout          = 15
  memory_size      = 128
  layers           = ["${aws_lambda_layer_version.wkhtml_layer.arn}"]
  filename         = data.archive_file.lambda_hello_world_zip.output_path
  source_code_hash = data.archive_file.lambda_hello_world_zip.output_base64sha256
  role             = aws_iam_role.lambda_exec.arn
}

resource "aws_cloudwatch_log_group" "hello_world" {
  name              = "/aws/lambda/${aws_lambda_function.hello_world.function_name}"
  retention_in_days = 3
}

resource "aws_iam_role" "lambda_exec" {
  name = "serverless_lambda"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Sid    = ""
      Principal = {
        Service = "lambda.amazonaws.com"
      }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_policy" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_lambda_function_url" "hello_world_url" {
  function_name      = aws_lambda_function.hello_world.function_name
  authorization_type = "NONE"
}

output "function_url" {
  description = "URL of the Lambda function."
  value       = aws_lambda_function_url.hello_world_url.function_url
}
