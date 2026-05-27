import { Router } from "express";
import {
  listCategories,
  listProducts,
  getProductBySlug,
  logContact
} from "../controllers/publicController.js";

const router = Router();

router.get("/categories", listCategories);
router.get("/products", listProducts);
router.get("/products/:slug", getProductBySlug);
router.post("/contact", logContact);

export default router;
