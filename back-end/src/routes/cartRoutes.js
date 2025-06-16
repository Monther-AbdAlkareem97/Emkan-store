import express from "express";
import {
  getCart,
  addToCart,
  removeFromCart,
  updateCartItem,
  clearCart, // استيراد الدالة الجديدة
} from "../controllers/cartController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, getCart);
router.post("/add", auth, addToCart);
router.post("/remove", auth, removeFromCart);
router.post("/update", auth, updateCartItem);
router.post("/clear", auth, clearCart); // إضافة مسار تفريغ السلة

export default router;
