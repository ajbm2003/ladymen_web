import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import publicRoutes from "./routes/public.js";
import adminRoutes from "./routes/admin.js";
import uploadRoutes from "./routes/upload.js";
import healthRoutes from "./routes/health.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const allowedOrigins = [process.env.FRONTEND_URL, process.env.ADMIN_URL].filter(Boolean);

if (process.env.NODE_ENV !== "production") {
  allowedOrigins.push("http://localhost:5173", "http://localhost:5174", "http://localhost:4173");
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"]
  })
);

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

app.use("/static", express.static(path.join(__dirname, "../public")));

// Serve uploaded files (images and videos)
app.use("/uploads", express.static(path.join(__dirname, "../uploads"), {
  maxAge: "30d",
  immutable: true
}));

app.use(
  rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.use("/api", publicRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin", uploadRoutes);
app.use("/api", healthRoutes);

// Serve frontend static files in production
if (process.env.NODE_ENV === "production") {
  const frontendDist = path.join(__dirname, "../public/frontend");
  const adminDist = path.join(__dirname, "../public/admin");

  app.use("/admin", express.static(adminDist));
  app.use(express.static(frontendDist));

  // Admin SPA fallback
  app.get("/admin/*", (req, res) => {
    res.sendFile(path.join(adminDist, "index.html"));
  });

  // Frontend SPA fallback
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/uploads") || req.path.startsWith("/static")) {
      return next();
    }
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use(errorHandler);

app.listen(port, "0.0.0.0", () => {
  console.log(`API listening on port ${port}`);
});
