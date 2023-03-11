import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { APIGatewayEvent } from "aws-lambda";
import {
  createResponse,
  getRequestValidationErrors,
  loadFileFromS3,
} from "./helper";
import { WkOptions, Request } from "./types";
import wkhtmltopdf from "./wkhtmltopdf";

const s3Client = new S3Client({});

module.exports.handler = async (event: APIGatewayEvent) => {
  console.log("Received event", JSON.stringify(event));

  const rawRequest = JSON.parse(event.body ?? "{}") as Request;
  const defaultOptions: WkOptions = {
    marginTop: 0,
    marginRight: 0,
    marginBottom: 0,
    marginLeft: 0,
    orientation: "Portrait",
  }
  const request = {...defaultOptions, ...rawRequest};
  const validationErrors = getRequestValidationErrors(request);

  if (validationErrors.length) {
    return createResponse(400, validationErrors.join(","));
  }

  const s3Bucket = process.env.S3_BUCKET_NAME;
  const pdfData = await wkhtmltopdf(
    request,
    request.uri.startsWith("http")
      ? request.uri
      : await loadFileFromS3(s3Client, request.uri)
  );

  await s3Client.send(
    new PutObjectCommand({
      Bucket: s3Bucket,
      Key: request.fileName,
      Body: pdfData,
    })
  );

  return createResponse(200, `File saved to ${s3Bucket}/${request.fileName}`);
};
