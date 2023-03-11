# HTML to PDF with AWS Lambda, Wkhtmltopdf, Terraform
AWS Lambda HTML to PDF converter

Uses a Terraform script to
- provision a Lambda layer which contains the **Wkhtmltopdf** binaries and custom fonts
- create a Nodes.js Lambda with a function URL
- S3 buckets containing a sample input HTML and output for the PDF

## Deploying Lambda
```bash
npm run build
terraform init
terraform apply
```

After deploying you can invoke the Lambda:

```sh
curl -H 'Content-Type: application/json' -d '{"uri": "https://www.google.com", "fileName": "sample.pdf"}' -X POST $(terraform output -raw function_url) -i
```

Available parameters are:

```json
{
  "uri": "https://example.com", // URL or input S3 key
  "fileName": "converted.pdf" // Name of the converted file,
  "orientation": "Landscape", // Optional: Landscape or Portrait
  "marginTop:": "number", // Optional: top margin
  "marginRight": "number", // Optional: right margin
  "marginBottom": "number", // Optional: bottom margin
  "marginLeft": "number" // Optional: left margin
}
```

Tailing the Lambda logs
```sh
aws logs tail "$(terraform output -raw lambda_log_group)" --follow
```

Copy and open the downloaded file (Mac), replace `open` with `start` on Windows

```sh
aws s3 cp "s3://$(terraform output -raw s3_bucket)/sample.pdf" . && open sample.pdf
```
