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

export const getRequestValidationErrors = (req: Request): string[] => {
  const orientations = ["Landscape", "Portrait"];
  const rules = new Map<boolean, string>()
    .set(
      !req.uri || !req.uri.match(/s3:\/\/|https?:\/\//),
      "Bad input uri, was expecting http(s)://www.example.com or s3://your-bucket/your-file"
    )
    .set(!req.fileName?.length, "fileName not set")
    .set(
      !req.orientation || !orientations.includes(req.orientation),
      `${req.orientation} not in ${orientations.join()}`
    )
    .set(isNotValidSize(req.marginTop), "'marginTop' not valid")
    .set(isNotValidSize(req.marginRight), "'marginRight' not valid")
    .set(isNotValidSize(req.marginBottom), "'marginBottom' not valid")
    .set(isNotValidSize(req.marginLeft), "'marginLeft' not valid");

  return [...rules].filter(([fail, _]) => fail).map(([_, msg]) => msg);
};

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

const isNotValidSize = (n: unknown) => typeof n !== "number" || n < 0;
