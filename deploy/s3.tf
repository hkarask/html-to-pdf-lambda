resource "aws_s3_bucket" "html_to_pdf_bucket" {
  bucket        = "html-to-pdf-demo"
  force_destroy = true
}

resource "aws_s3_object" "sample_html" {
  bucket = aws_s3_bucket.html_to_pdf_bucket.id
  key    = "sample.html"
  source = "sample.html"
  etag   = filemd5("sample.html")
}
