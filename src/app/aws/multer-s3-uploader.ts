/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request } from "express";
import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";

/**
 * Configure and setup AWS S3 client
 */
const s3 = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

/**
 * Setup file upload to AWS S3
 */
export const uploadFile = () => {
  const fileFilter = (req: Request, file: any, cb: any) => {
    const allowedFieldnames = [
      "image",
      "profile_image",
      "league_image",
      "category_image",
      "team_logo",
      "team_bg_image",
      "player_image",
      "player_bg_image",
      "story_image",
      "video",
      "thumbnail",
      "chat_images",
      "chat_videos",
      "product_image",
      "course_banner",
      "banner",
      "brand_image",
    ];

    if (file.fieldname === undefined) {
      // Allow requests without any files
      cb(null, true);
    } else if (allowedFieldnames.includes(file.fieldname)) {
      if (
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/webp" ||
        file.mimetype === "video/mp4" ||
        file.mimetype === "video/mov" ||
        file.mimetype === "video/quicktime" ||
        file.mimetype === "video/mpeg" ||
        file.mimetype === "video/ogg" ||
        file.mimetype === "video/webm" ||
        file.mimetype === "video/x-msvideo" ||
        file.mimetype === "video/x-flv" ||
        file.mimetype === "video/3gpp" ||
        file.mimetype === "video/3gpp2" ||
        file.mimetype === "video/x-matroska"
      ) {
        cb(null, true);
      } else {
        cb(new Error("Invalid file type"));
      }
    } else {
      cb(new Error("Invalid fieldname"));
    }
  };

  const storage = multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET_NAME || "your-bucket-name",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    // Removing ACL setting as your bucket doesn't support ACLs
    key: function (req, file, cb) {
      let uploadPath = "";

      // Maintain the same folder structure as before
      if (file.fieldname === "profile_image") {
        uploadPath = "uploads/images/profile";
      } else if (file.fieldname === "category_image") {
        uploadPath = "uploads/images/category";
      } else if (file.fieldname === "video") {
        uploadPath = "uploads/videos";
      } else if (file.fieldname === "product_image") {
        uploadPath = "uploads/images/product_image";
      } else if (file.fieldname === "chat_images") {
        uploadPath = "uploads/images/chat_image";
      } else if (file.fieldname === "chat_videos") {
        uploadPath = "uploads/videos/chat_videos";
      } else if (file.fieldname === "banner") {
        uploadPath = "uploads/images/banner_image";
      } else if (file.fieldname === "team_bg_image") {
        uploadPath = "uploads/images/team_bg_image";
      } else if (file.fieldname === "story_image") {
        uploadPath = "uploads/images/story_image";
      } else if (file.fieldname === "brand_image") {
        uploadPath = "uploads/images/brand_image";
      } else if (file.fieldname === "course_banner") {
        uploadPath = "uploads/images/course_banner";
      } else if (file.fieldname === "thumbnail") {
        uploadPath = "uploads/images/thumbnail";
      } else {
        uploadPath = "uploads";
      }

      // Sanitize the filename just like in the original code
      const sanitizedOriginalName = file.originalname.replace(/\s+/g, "_").replace(/[^\w.-]+/g, "");

      const name = Date.now() + "-" + sanitizedOriginalName;

      // Construct the full S3 key (path + filename)
      const fullPath = `${uploadPath}/${name}`;

      cb(null, fullPath);
    },
  });

  const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB limit, adjust as needed
    },
  }).fields([
    { name: "image", maxCount: 1 },
    { name: "profile_image", maxCount: 1 },
    { name: "category_image", maxCount: 2 },
    { name: "sub_category_image", maxCount: 1 },
    { name: "league_image", maxCount: 5 },
    { name: "story_image", maxCount: 1 },
    { name: "team_bg_image", maxCount: 1 },
    { name: "class_banner", maxCount: 1 },
    { name: "player_bg_image", maxCount: 1 },
    { name: "banner", maxCount: 1 },
    { name: "brand_image", maxCount: 1 },
    { name: "video", maxCount: 5 },
    { name: "chat_videos", maxCount: 2 },
    { name: "chat_images", maxCount: 7 },
    { name: "product_image", maxCount: 7 },
  ]);

  return upload;
};

export const getCloudFrontUrl = (s3FilePath: string): string => {
  return `${process.env.CLOUDFRONT_URL}/${s3FilePath}`;
};
