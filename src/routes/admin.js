import { Router } from "express";
import {
  loginAdmin,
  listAdminProducts,
  getAdminProduct,
  createProduct,
  updateProduct,
  archiveProduct,
  deleteProduct,
  updateProductStatus
} from "../controllers/adminController.js";
import { verifyAdminToken } from "../middleware/auth.js";
import { validateProduct } from "../middleware/validateProduct.js";

const router = Router();

router.post("/login", loginAdmin);
router.get("/products", verifyAdminToken, listAdminProducts);
router.get("/products/:id", verifyAdminToken, getAdminProduct);
router.post("/products", verifyAdminToken, validateProduct, createProduct);
router.put("/products/:id", verifyAdminToken, validateProduct, updateProduct);
router.delete("/products/:id", verifyAdminToken, deleteProduct);
router.patch("/products/:id/status", verifyAdminToken, updateProductStatus);

export default router;
