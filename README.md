# HTML to PDF with AWS Lambda, Wkhtmltopdf, Terraform
AWS Lambda HTML to PDF converter

# Deploying Lambda
```bash
npm run build
terraform init
terraform apply
```

# Tail Lambda logs
```sh
aws logs tail "$(terraform output -raw lambda_log_group)" --follow
```

# Invoke Lambda
```sh
curl -H 'Content-Type: application/json' -d '{"foo": "bar"}' -X POST $(terraform output -raw function_url)
```
