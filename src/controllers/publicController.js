import { Prisma } from "@prisma/client";
import prisma from "../utils/prisma.js";

export const listCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" }
    });
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

export const listProducts = async (req, res, next) => {
  try {
    const { category, minPrice, maxPrice, search } = req.query;
    const where = {
      status: "available"
    };

    if (category) {
      const categoryId = Number(category);
      if (Number.isInteger(categoryId)) {
        where.categoryId = categoryId;
      } else {
        const categoryRecord = await prisma.category.findUnique({
          where: { slug: String(category) }
        });
        if (categoryRecord) {
          where.categoryId = categoryRecord.id;
        }
      }
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) {
        where.price.gte = new Prisma.Decimal(minPrice);
      }
      if (maxPrice) {
        where.price.lte = new Prisma.Decimal(maxPrice);
      }
    }

    if (search) {
      where.name = {
        contains: String(search),
        mode: "insensitive"
      };
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        images: {
          orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }]
        },
        category: true
      },
      take: 2000
    });

    res.json(products);
  } catch (error) {
    next(error);
  }
};

export const getProductBySlug = async (req, res, next) => {
  try {
    const product = await prisma.product.findFirst({
      where: {
        slug: req.params.slug,
        status: "available"
      },
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

    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const logContact = async (req, res, next) => {
  try {
    const { productId } = req.body || {};
    await prisma.contactLog.create({
      data: {
        productId: productId ? Number(productId) : null,
        userAgent: req.headers["user-agent"] || null
      }
    });
    res.status(201).json({ success: true });
  } catch (error) {
    next(error);
  }
};
