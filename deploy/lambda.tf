data "archive_file" "lambda_hello_world_zip" {
  type = "zip"

  source_dir  = "${path.module}/../dist/lambda"
  output_path = "${path.module}/../dist/lambda.zip"
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

resource "aws_iam_policy" "wkhtml_lambda_policy" {
  name        = "wkhtml_lambda_policy"
  path        = "/"
  description = "IAM policy for Wkhtml"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
        "Effect": "Allow",
        "Action": [
            "s3:ListAllMyBuckets",
            "s3:GetBucketLocation"
        ],
        "Resource": "*"
    },
    {
        "Effect": "Allow",
        "Action": "s3:*",
        "Resource": [
            "arn:aws:s3:::html-to-pdf-demo",
            "arn:aws:s3:::html-to-pdf-demo/*"
        ]
    },
    {
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*",
      "Effect": "Allow"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = aws_iam_policy.wkhtml_lambda_policy.arn
}

resource "aws_lambda_function_url" "hello_world_url" {
  function_name      = aws_lambda_function.hello_world.function_name
  authorization_type = "NONE"
}

output "function_url" {
  description = "URL of the Lambda function."
  value       = aws_lambda_function_url.hello_world_url.function_url
}
