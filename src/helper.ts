import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Stream } from "node:stream";
import { Request } from "./types";

export const createResponse = (statusCode: number, message: string) => ({
  statusCode: statusCode,
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    message,
  }),
});

export const getRequestValidationErrors = (req: Request): string[] => [
  ...validationErrors(req),
];

export const loadFileFromS3 = async (
  s3Client: S3Client,
  uri: string
): Promise<Stream> => {
  const [, path] = uri.split("://");
  const [s3Bucket, ...rest] = path.split("/");
  const s3Key = rest.join("/");

  try {
    const getObjectResponse = await s3Client.send(
      new GetObjectCommand({ Bucket: s3Bucket, Key: s3Key })
    );
    return getObjectResponse.Body as Stream;
  } catch (error) {
    throw new Error(`S3 getObject failed ${error}`);
  }
};

function* validationErrors(req: Request) {
  if (!req.uri || !req.uri.match(/s3:\/\/|https?:\/\//))
    yield "Bad input uri, was expecting http(s)://www.example.com or s3://your-bucket/your-file";

  if (!req.fileName?.length) yield "'fileName' not set";

  const orientations = ["Landscape", "Portrait"];
  if (!req.orientation || !orientations.includes(req.orientation))
    yield `'orientation' not in ${orientations.join()}`;

  if (isNotValidSize(req.marginTop)) yield "'marginTop' not valid";
  if (isNotValidSize(req.marginRight)) yield "'marginRight' not valid";
  if (isNotValidSize(req.marginBottom)) yield "'marginBottom' not valid";
  if (isNotValidSize(req.marginLeft)) yield "'marginLeft' not valid";
}

const isNotValidSize = (n: unknown) => typeof n !== "number" || n < 0;
