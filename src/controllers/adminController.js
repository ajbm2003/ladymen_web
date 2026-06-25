import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import prisma from "../utils/prisma.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.resolve(__dirname, "../../uploads");

const jwtExpiry = "7d";

/**
 * Delete a local file from the uploads directory.
 * Only deletes files that are under /uploads/ path.
 */
const deleteLocalFile = (fileUrl) => {
  if (!fileUrl || !fileUrl.startsWith("/uploads/")) return;
  const filePath = path.join(UPLOADS_DIR, fileUrl.replace("/uploads/", ""));
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.warn("Local file delete failed", filePath, error.message);
  }
};

const deleteLocalAssets = ({ imageUrls = [], videoUrl = "" }) => {
  for (const url of imageUrls) {
    deleteLocalFile(url);
  }
  if (videoUrl) {
    deleteLocalFile(videoUrl);
  }
};

const buildSoldOutSlug = (currentSlug, productId) => {
  const suffix = `-sold-${productId}`;
  if (!currentSlug) return `${productId}${suffix}`;
  return currentSlug.endsWith(suffix) ? currentSlug : `${currentSlug}${suffix}`;
};

const releaseSlugIfSoldOut = async (slug) => {
  if (!slug) return { released: false, conflict: false };
  const existing = await prisma.product.findUnique({ where: { slug } });
  if (!existing) return { released: false, conflict: false };

  const soldOut = existing.status === "sold" || existing.stock === 0;
  if (!soldOut) {
    return { released: false, conflict: true };
  }

  await prisma.product.update({
    where: { id: existing.id },
    data: { slug: buildSoldOutSlug(existing.slug, existing.id) }
  });

  return { released: true, conflict: false };
};

export const loginAdmin = async (req, res) => {
  const { email, pin } = req.body || {};

  if (!email || !pin) {
    return res.status(400).json({ message: "Missing credentials" });
  }

  if (email !== process.env.ADMIN_EMAIL) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const match = await bcrypt.compare(String(pin), process.env.ADMIN_PASSWORD_HASH || "");

  if (!match) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, {
    expiresIn: jwtExpiry
  });

  return res.json({ token, expiresIn: jwtExpiry });
};

export const listAdminProducts = async (req, res, next) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) {
      where.status = status;
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        images: {
          orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }]
        },
        category: true
      }
    });

    res.json(products);
  } catch (error) {
    next(error);
  }
};

export const getAdminProduct = async (req, res, next) => {
  try {
    const productId = Number(req.params.id);
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        images: {
          orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }]
        },
        variants: true,
        category: true
      }
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json(product);
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const data = req.validated;

    const slugCheck = await releaseSlugIfSoldOut(data.slug);
    if (slugCheck.conflict) {
      return res.status(409).json({ message: "Slug already in use" });
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        price: data.price,
        stock: data.stock ?? 0,
        soldUnits: data.soldUnits ?? 0,
        status: data.status || "available",
        categoryId: data.categoryId,
        videoUrl: data.videoUrl || null,
        images: data.images ? { create: data.images } : undefined,
        variants: data.variants ? { create: data.variants } : undefined
      },
      include: {
        images: true,
        variants: true,
        category: true
      }
    });

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const data = req.validated;
    const productId = Number(req.params.id);

    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: { images: true }
    });

    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (data.slug && data.slug !== existingProduct.slug) {
      const slugCheck = await releaseSlugIfSoldOut(data.slug);
      if (slugCheck.conflict) {
        return res.status(409).json({ message: "Slug already in use" });
      }
    }

    const targetStock = typeof data.stock === "number" ? data.stock : existingProduct.stock;
    const soldOut = targetStock === 0;
    const soldOutSlug = soldOut
      ? buildSoldOutSlug(existingProduct.slug, productId)
      : undefined;

    if (soldOut) {
      deleteLocalAssets({
        imageUrls: existingProduct.images.map((image) => image.url),
        videoUrl: existingProduct.videoUrl || ""
      });
    }

    const product = await prisma.$transaction(async (tx) => {
      if (data.images || soldOut) {
        await tx.productImage.deleteMany({ where: { productId } });
      }
      if (data.variants) {
        await tx.variant.deleteMany({ where: { productId } });
      }

      return tx.product.update({
        where: { id: productId },
        data: {
          name: data.name,
          slug: soldOut ? soldOutSlug : data.slug,
          description: data.description,
          price: data.price,
          stock: targetStock ?? 0,
          soldUnits: data.soldUnits ?? undefined,
          status: data.status || "available",
          categoryId: data.categoryId,
          videoUrl: data.videoUrl ?? null,
          images: data.images && !soldOut ? { create: data.images } : undefined,
          variants: data.variants ? { create: data.variants } : undefined
        },
        include: {
          images: true,
          variants: true,
          category: true
        }
      });
    });

    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const archiveProduct = async (req, res, next) => {
  try {
    const productId = Number(req.params.id);
    const product = await prisma.product.update({
      where: { id: productId },
      data: { status: "archived" }
    });

    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const productId = Number(req.params.id);
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { images: true }
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const imageUrls = product.images.map((image) => image.url);
    deleteLocalAssets({ imageUrls, videoUrl: product.videoUrl || "" });

    await prisma.product.delete({ where: { id: productId } });
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const updateProductStatus = async (req, res, next) => {
  try {
    const productId = Number(req.params.id);
    const { status, quantity } = req.body || {};

    if (!status || !["available", "sold", "archived"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    if (status === "sold") {
      const productWithImages = await prisma.product.findUnique({
        where: { id: productId },
        include: { images: true }
      });

      if (!productWithImages) {
        return res.status(404).json({ message: "Product not found" });
      }

      const requestedQty = Number(quantity || 1);
      const safeQty = Number.isFinite(requestedQty) && requestedQty > 0 ? requestedQty : 1;
      const currentStock = productWithImages.stock || 0;
      const soldQty = Math.min(safeQty, currentStock);
      const nextStock = Math.max(0, currentStock - soldQty);

      if (nextStock === 0) {
        const imageUrls = productWithImages.images.map((image) => image.url);
        deleteLocalAssets({
          imageUrls,
          videoUrl: productWithImages.videoUrl || ""
        });

        await prisma.productImage.deleteMany({ where: { productId } });
      }

      const product = await prisma.product.update({
        where: { id: productId },
        data: {
          stock: nextStock,
          soldUnits: { increment: soldQty },
          status: nextStock === 0 ? "sold" : "available",
          soldAt: nextStock === 0 ? new Date() : null,
          slug: nextStock === 0 ? buildSoldOutSlug(productWithImages.slug, productId) : undefined
        }
      });

      return res.json(product);
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        status,
        soldAt: status === "sold" ? new Date() : null
      }
    });

    return res.json(product);
  } catch (error) {
    next(error);
  }
};
