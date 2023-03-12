# HTML to PDF with AWS Lambda, Wkhtmltopdf, Terraform
HTML to PDF converter hosted in AWS Lambda, using:
- **Terraform** to provision the Lambda
- **Typescript** to invoke the Wkhtmltopdf

Blog post describing the problem & solution: [https://karask.com/generate-html-to-pdf-using-aws-lambda-and-wkhtmltopdf](https://karask.com/generate-html-to-pdf-using-aws-lambda-and-wkhtmltopdf)


## Deploy
Modify the Lambda name and S3 bucket inside the `variables.tf`
```sh
npm run build
terraform apply
```

## How to use

After deploying you can invoke the Lambda using the published function URL:

```sh
curl -H 'Content-Type: application/json' \
  -d '{"uri": "https://www.google.com", "fileName": "sample.pdf"}' \
  -X POST $(terraform output -raw function_url) -i
```
Where `uri` is either an URL or S3 file key.

Available parameters are:

```js
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

This then triggers the **Lambda**, passes the options to **Wkhtmltopdf** and saves the converted PDF to a configured S3 bucket.

```http
HTTP/1.1 200 OK
Date: Sat, 11 Mar 2023 04:51:55 GMT
Content-Type: application/json

{"message":"File saved to lambda-html-to-pdf-files/sample.pdf"}
```

or you might get a validation error if you missed something:
```http
HTTP/1.1 400 Bad Request
Date: Sat, 11 Mar 2023 04:53:33 GMT
Content-Type: application/json

{"message":"fileName not set"}
```

## Utilities

Tailing the Lambda logs
```sh
aws logs tail "$(terraform output -raw lambda_log_group)" --follow
```

Copy and open the downloaded file (Mac), replace `open` with `start` on Windows

```sh
aws s3 cp "s3://$(terraform output -raw s3_bucket)/sample.pdf" . && open sample.pdf
```
