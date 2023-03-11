variable "aws_region" {
  description = "AWS region for all resources."
  type    = string
  default = "ap-southeast-2"
}

variable "function_name" {
  description = "Lambda function name"
  type        = string
  default     = "html-to-pdf"
}

variable "s3_bucket_name" {
  description = "S3 Bucket to store files in"
  type        = string
  default     = "lambda-html-to-pdf-files"
}
