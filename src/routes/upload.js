import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import sharp from "sharp";
import { verifyAdminToken } from "../middleware/auth.js";

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_DIR = path.resolve(__dirname, "../../uploads");
const IMAGES_DIR = path.join(UPLOADS_DIR, "images");
const VIDEOS_DIR = path.join(UPLOADS_DIR, "videos");

// Ensure upload directories exist
[UPLOADS_DIR, IMAGES_DIR, VIDEOS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const allowedImageMimeTypes = ["image/jpeg", "image/png", "image/webp"];
const allowedVideoMimeTypes = ["video/mp4", "video/webm", "video/quicktime"];

// Temporary storage for images — we process them with sharp afterward
const imageStorage = multer.memoryStorage();

const upload = multer({
  storage: imageStorage,
  limits: { fileSize: 10 * 1024 * 1024, files: 3 },
  fileFilter: (req, file, callback) => {
    if (!allowedImageMimeTypes.includes(file.mimetype)) {
      return callback(new Error("Invalid file type. Only JPEG, PNG and WebP are allowed."));
    }
    return callback(null, true);
  }
});

// Video storage directly to disk
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, VIDEOS_DIR),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const uploadVideo = multer({
  storage: videoStorage,
  limits: { fileSize: 50 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, callback) => {
    if (!allowedVideoMimeTypes.includes(file.mimetype)) {
      return callback(new Error("Invalid video type. Only MP4, WebM and MOV are allowed."));
    }
    return callback(null, true);
  }
});

/**
 * Compress and save an image using sharp.
 * Target: max 2MB, WebP format, max width 1200px.
 */
const compressAndSaveImage = async (buffer, originalName) => {
  const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
  const outputPath = path.join(IMAGES_DIR, uniqueName);

  let quality = 80;
  let outputBuffer = await sharp(buffer)
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality })
    .toBuffer();

  // Iteratively reduce quality until under 2MB
  const MAX_SIZE = 2 * 1024 * 1024;
  while (outputBuffer.length > MAX_SIZE && quality > 20) {
    quality -= 10;
    outputBuffer = await sharp(buffer)
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality })
      .toBuffer();
  }

  // If still too large, reduce dimensions
  if (outputBuffer.length > MAX_SIZE) {
    outputBuffer = await sharp(buffer)
      .resize({ width: 800, withoutEnlargement: true })
      .webp({ quality: 20 })
      .toBuffer();
  }

  await fs.promises.writeFile(outputPath, outputBuffer);

  return {
    filename: uniqueName,
    size: outputBuffer.length
  };
};

// Upload images endpoint
router.post("/upload", verifyAdminToken, upload.array("images", 3), async (req, res) => {
  try {
    const files = req.files || [];
    if (!files.length) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    const results = [];
    for (const file of files) {
      const saved = await compressAndSaveImage(file.buffer, file.originalname);
      const url = `/uploads/images/${saved.filename}`;
      results.push({
        url,
        secure_url: url,
        filename: saved.filename,
        size: saved.size
      });
    }

    return res.status(201).json(results);
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ message: "Upload failed", error: error.message });
  }
});

// Upload video endpoint
router.post("/upload-video", verifyAdminToken, uploadVideo.single("video"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No video uploaded" });
  }

  const url = `/uploads/videos/${req.file.filename}`;
  return res.status(201).json({
    url,
    secure_url: url,
    filename: req.file.filename,
    size: req.file.size
  });
});

export default router;
