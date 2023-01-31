
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Stream } from "node:stream";
import { WkOptions, ValidateGeneratePdfRequest } from "./types";
import wkhtmltopdf from "./wkhtmltopdf";

module.exports.handler = async (event: WkOptions) => {
  console.debug('Received event', JSON.stringify(event));

  event.marginTop = 0;
  event.marginRight = 0;
  event.marginBottom = 0;
  event.marginLeft = 0;
  event.orientation = 'Portrait';

  ValidateGeneratePdfRequest(event);

  const s3Client = new S3Client({});

  let getObjectResponse;
  try {
    getObjectResponse = await s3Client.send(new GetObjectCommand({ Bucket: 'html-to-pdf-demo', Key: 'sample.html'}));
  } catch (error) {
    throw new Error(`S3 getObject failed ${error}`);
  }

  const pdfData = await wkhtmltopdf(getObjectResponse.Body as Stream, event);

  await s3.upload({
    Bucket: 'html-to-pdf-demo',
    Key: 'sample.pdf',
    Body: pdfData
  }).promise()

  const responseMessage = "Hello World";

  return {
    statusCode: 201,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: responseMessage,
    }),
  };
};
