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
curl -H 'Content-Type: application/json' -d '{"foo": "bar"}' -X POST $(terraform output -raw function_url)
```


Tailing the Lambda logs
```sh
aws logs tail "$(terraform output -raw lambda_log_group)" --follow
```
