import express from "express";
import productController from "../controllers/productController.js";
import upload from "../middleware/uploade.js";
const router = express.Router();

router.post("/", upload.single("image"), productController.createProduct);
router.get("/", productController.getProducts);
router.get("/:id", productController.getProductById);
router.put("/:id", upload.single("image"), productController.updateProduct);
router.delete("/:id", productController.deleteProduct);
// إضافة أو تحديث تخفيض على منتج
router.put("/:id/offer", productController.setProductOffer);

export default router;
