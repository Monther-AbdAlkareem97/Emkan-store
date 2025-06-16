import express from "express";
import {
  register,
  login,
  logout,
  getUsers,
} from "../controllers/authController.js";
import { auth, adminOnly } from "../middleware/auth.js";
import User from "../models/User.js";
const router = express.Router();

// تسجيل مستخدم جديد
router.post("/register", register);
// تسجيل الدخول
router.post("/login", login);
// تسجيل الخروج
router.post("/logout", logout);
// جلب جميع المستخدمين (أدمن فقط)
router.get("/", auth, adminOnly, getUsers);
// جلب بيانات المستخدم الحالي
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId); // استخدم userId من التوكن
    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }
    res.json({
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        photo: user.photo,
        address: user.address,
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "خطأ في جلب المستخدم", error: err.message });
  }
});

export default router;
