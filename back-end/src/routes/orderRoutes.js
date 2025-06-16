import express from "express";
import {
  createOrder,
  getAllOrders,
  getUserOrders,
  approveOrder,
  cancelOrder,
} from "../controllers/orderController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// إنشاء طلب جديد (مستخدم)
router.post("/", auth, createOrder);
// جلب جميع الطلبات (أدمن)
router.get("/all", auth, getAllOrders);
// جلب طلبات المستخدم الحالي
router.get("/my", auth, getUserOrders);
// موافقة الأدمن على الطلب
router.post("/approve", auth, approveOrder);
// إلغاء الطلب (مستخدم أو أدمن)
router.post("/cancel", auth, cancelOrder);

export default router;
