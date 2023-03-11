resource "aws_s3_bucket" "function_html_input" {
  bucket        = "${var.s3_bucket_name}"
  force_destroy = true
}

resource "aws_s3_object" "sample_html" {
  bucket = aws_s3_bucket.function_html_input.id
  key    = "sample.html"
  source = "sample.html"
  etag   = filemd5("sample.html")
}
