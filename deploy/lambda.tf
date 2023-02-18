data "archive_file" "function_zip" {
  type = "zip"

  source_dir  = "${path.module}/../dist/lambda"
  output_path = "${path.module}/../dist/lambda.zip"
}

resource "aws_lambda_function" "function" {
  function_name    = "${var.function_name}"
  runtime          = "nodejs18.x"
  handler          = "index.handler"
  timeout          = 15
  memory_size      = 128
  layers           = ["${aws_lambda_layer_version.function_layer.arn}"]
  filename         = data.archive_file.function_zip.output_path
  source_code_hash = data.archive_file.function_zip.output_base64sha256
  role             = aws_iam_role.function_role.arn

}

resource "aws_cloudwatch_log_group" "function" {
  name              = "/aws/lambda/${aws_lambda_function.function.function_name}"
  retention_in_days = 3
}

resource "aws_iam_role" "function_role" {
  name = "${var.function_name}_role"
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

resource "aws_iam_policy" "function_policy" {
  name        = "${var.function_name}_policy"
  path        = "/"
  description = "IAM policy for ${var.function_name}"

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
            "arn:aws:s3:::${var.function_name}-input",
            "arn:aws:s3:::${var.function_name}-input/*"
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

resource "aws_iam_role_policy_attachment" "function_logs" {
  role       = aws_iam_role.function_role.name
  policy_arn = aws_iam_policy.function_policy.arn
}

resource "aws_lambda_function_url" "function_url" {
  function_name      = aws_lambda_function.function.function_name
  authorization_type = "NONE"
}

output "function_url" {
  description = "URL of the Lambda function."
  value       = aws_lambda_function_url.function_url.function_url
}

output "lambda_log_group" {
  description = "Name of the Lambda's log group"
  value = aws_cloudwatch_log_group.function.name
}
