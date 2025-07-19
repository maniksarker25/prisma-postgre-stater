// with verser 3
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";
import httpStatus from "http-status";
import AppError from "../errors/appError";

dotenv.config();

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

interface GeneratePresignedUrlRequest {
  fileType: string;
  fileCategory: string;
}

export const generatePresignedUrl = async ({
  fileType,
  fileCategory,
}: GeneratePresignedUrlRequest) => {
  const timestamp = Date.now();

  let folder = "";
  if (fileCategory === "profile_image") {
    folder = "uploads/images/profile/";
  } else if (fileCategory === "project_image") {
    folder = "uploads/images/project_image/";
  } else if (fileCategory === "podcast_video") {
    folder = "uploads/videos/";
  } else if (fileCategory === "project_document") {
    folder = "uploads/documents/project_document/";
  } else if (fileCategory === "material_image") {
    folder = "uploads/images/project_material_image/";
  } else if (fileCategory === "podcast_audio") {
    folder = "uploads/audios/";
  }

  const fileName = `${folder}${timestamp}-${Math.random().toString(36).substring(2, 15)}.${
    fileType.split("/")[1]
  }`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: fileName,
    ContentType: fileType,
    // ACL: 'public-read', // You can add this if needed and your bucket allows it
  });

  try {
    const uploadURL = await getSignedUrl(s3, command, { expiresIn: 60 }); // URL valid for 60 seconds
    return { uploadURL, fileName };
  } catch (err) {
    console.error("Error generating presigned URL:", err);
    throw new AppError(httpStatus.SERVICE_UNAVAILABLE, "Error generating presigned URL");
  }
};

export const generateMultiplePresignedUrls = async (
  files: Array<{ fileType: string; fileCategory: string }>
) => {
  try {
    const presignedUrls = await Promise.all(
      files.map(async (file) => {
        return await generatePresignedUrl(file);
      })
    );
    return presignedUrls;
  } catch (err) {
    console.error("Error generating multiple presigned URLs:", err);
    throw new AppError(httpStatus.SERVICE_UNAVAILABLE, "Error generating multiple presigned URLs");
  }
};
