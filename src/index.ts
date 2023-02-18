import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { APIGatewayEvent } from "aws-lambda";
import { Stream } from "node:stream";
import { WkOptions, ValidateGeneratePdfRequest } from "./types";
import wkhtmltopdf from "./wkhtmltopdf";

module.exports.handler = async (event: APIGatewayEvent) => {
  console.log("Received event", JSON.stringify(event));
  console.info("raw body is", event.body);

  if (event.body) {
    const body = JSON.parse(event.body);
    console.info('🔵 body.foo', body.foo);
  }

  //TODO: use url instead
  const s3Client = new S3Client({});
  let getObjectResponse;
  try {
    getObjectResponse = await s3Client.send(
      new GetObjectCommand({ Bucket: "html-to-pdf-input", Key: "sample.html" })
    );
  } catch (error) {
    throw new Error(`S3 getObject failed ${error}`);
  }

  const wkOptions: WkOptions = {
    marginTop: 0,
    marginRight: 0,
    marginBottom: 0,
    marginLeft: 0,
    orientation: "Portrait",
    input: getObjectResponse.Body as Stream,
  };

  ValidateGeneratePdfRequest(wkOptions);

  const pdfData = await wkhtmltopdf(wkOptions);

  const s3Bucket = "html-to-pdf-input";
  const s3Key = "sample.pdf";

  await s3Client.send(
    new PutObjectCommand({
      Bucket: s3Bucket,
      Key: s3Key,
      Body: pdfData,
    })
  );

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: `File saved to ${s3Bucket}/${s3Key}`,
    }),
  };
};
