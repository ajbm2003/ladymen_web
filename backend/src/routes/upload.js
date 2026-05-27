import { Router } from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import { verifyAdminToken } from "../middleware/auth.js";

const router = Router();

const cloudinaryEnabled = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
);

const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
const allowedVideoMimeTypes = ["video/mp4", "video/webm", "video/quicktime"];

if (cloudinaryEnabled) {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "catalogo-productos",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [{ width: 1200, crop: "limit" }]
    }
  });

  const videoStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "catalogo-videos",
      resource_type: "video",
      allowed_formats: ["mp4", "webm", "mov"],
      transformation: [{ width: 1280, crop: "limit" }]
    }
  });

  const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024, files: 3 },
    fileFilter: (req, file, callback) => {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return callback(new Error("Invalid file type"));
      }
      return callback(null, true);
    }
  });

  const uploadVideo = multer({
    storage: videoStorage,
    limits: { fileSize: 20 * 1024 * 1024, files: 1 },
    fileFilter: (req, file, callback) => {
      if (!allowedVideoMimeTypes.includes(file.mimetype)) {
        return callback(new Error("Invalid video type"));
      }
      return callback(null, true);
    }
  });

  router.post("/upload", verifyAdminToken, upload.array("images", 3), (req, res) => {
    const files = req.files || [];
    const response = files.map((file) => ({
      url: file.path,
      public_id: file.filename,
      secure_url: file.path
    }));

    res.status(201).json(response);
  });

  router.post("/upload-video", verifyAdminToken, uploadVideo.single("video"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No video uploaded" });
    }

    return res.status(201).json({
      url: req.file.path,
      public_id: req.file.filename,
      secure_url: req.file.path
    });
  });
} else {
  router.post("/upload", (req, res) => {
    res.status(503).json({ message: "Cloudinary not configured" });
  });
  router.post("/upload-video", (req, res) => {
    res.status(503).json({ message: "Cloudinary not configured" });
  });
}

export default router;
