import { pipeline } from "node:stream/promises";
import { Upload } from "@aws-sdk/lib-storage";
import { createReadStream, createWriteStream } from "node:fs";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  endpoint: process.env.DO_SPACES_ENDPOINT,
  region: process.env.DO_SPACES_REGION,
  credentials: {
    accessKeyId: process.env.DO_SPACES_ACCESS_KEY || "",
    secretAccessKey: process.env.DO_SPACES_SECRET_KEY || "",
  },
});

export const BUCKET_NAME = process.env.DO_SPACES_BUCKET;

// 1. Generate URL for Frontend to Upload DIRECTLY to S3
export async function getUploadUrl(key: string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
    ACL: "public-read",
  });
  // URL expires in 60 seconds (security best practice)
  return getSignedUrl(s3, command, { expiresIn: 60 });
}

// 2. Generate URL for downloading processed files
export async function getDownloadUrl(key: string, filename?: string) {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ResponseContentDisposition: filename ? `attachment; filename="${filename}"` : "attachment",
  });
  return getSignedUrl(s3, command, { expiresIn: 3600 });
}

export async function downloadFile(key: string, localPath: string) {
  const command = new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key });
  const response = await s3.send(command);

  if (!response.Body) throw new Error("File not found in S3");

  await pipeline(response.Body as NodeJS.ReadableStream, createWriteStream(localPath));
}

function getContentTypeFromKey(key: string): string {
  const ext = key.split(".").pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    pdf: "application/pdf",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    doc: "application/msword",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    xls: "application/vnd.ms-excel",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ppt: "application/vnd.ms-powerpoint",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
    txt: "text/plain",
    json: "application/json",
    zip: "application/zip",
  };
  return mimeTypes[ext || ""] || "application/octet-stream";
}

export const uploadFromFile = async (localPath: string, key: string, contentType?: string) => {
  const fileStream = createReadStream(localPath);
  const resolvedContentType = contentType || getContentTypeFromKey(key);

  const upload = new Upload({
    client: s3,
    params: {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileStream,
      ContentType: resolvedContentType,
    },
  });

  await upload.done();
};

export { s3 };
