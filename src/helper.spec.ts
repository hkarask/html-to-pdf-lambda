import { Request } from "./types";
import {
  createResponse,
  getRequestValidationErrors,
  loadFileFromS3,
} from "./helper";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

describe("when validating an empty request", () => {
  it("should return all errors", () => {
    const errors = getRequestValidationErrors({} as Request);
    expect(errors).toEqual([
      "Bad input uri, was expecting http(s)://www.example.com or s3://your-bucket/your-file",
      "'fileName' not set",
      "'orientation' not in Landscape,Portrait",
      "'marginTop' not valid",
      "'marginRight' not valid",
      "'marginBottom' not valid",
      "'marginLeft' not valid",
    ]);
  });
});

describe("when creating a response", () => {
  it("should should have correct values", () => {
    const response = createResponse(201, "foo");
    expect(response).toEqual({
      body: JSON.stringify({ message: "foo" }),
      headers: {
        "Content-Type": "application/json",
      },
      statusCode: 201,
    });
  });
});

describe("loadFileFromS3", () => {
  describe("when loading a file from S3", () => {
    it("it should provide correct bucket and key", async () => {
      const mockClient = { send: jest.fn(_ => ({ Body: 'foo' })) };

      const uri = "s3://my-bucket/my-key";
      const res = await loadFileFromS3(mockClient as unknown as S3Client, uri);
      expect(res).toBe('foo');
      expect(mockClient.send.mock.calls).toHaveLength(1);
      const input = (mockClient.send.mock.calls[0][0] as GetObjectCommand).input;
      expect(input).toEqual({ Bucket: 'my-bucket', Key: 'my-key' });
    });
  });
});
