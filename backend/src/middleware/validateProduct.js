import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional().nullable(),
  price: z.preprocess((value) => Number(value), z.number().positive()),
  stock: z.preprocess((value) => Number(value), z.number().int().min(0)).optional(),
  soldUnits: z.preprocess((value) => Number(value), z.number().int().min(0)).optional(),
  status: z.enum(["available", "sold", "archived"]).optional(),
  categoryId: z.preprocess((value) => Number(value), z.number().int().positive()),
  videoUrl: z.string().url().optional().nullable(),
  images: z
    .array(
      z.object({
        url: z.string().url(),
        isPrimary: z.boolean().optional(),
        sortOrder: z.number().int().optional()
      })
    )
    .max(3)
    .optional(),
  variants: z
    .array(
      z.object({
        name: z.string().min(1),
        value: z.string().min(1)
      })
    )
    .optional()
});

export const validateProduct = (req, res, next) => {
  const result = productSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Validation error",
      errors: result.error.flatten()
    });
  }

  req.validated = result.data;
  return next();
};
