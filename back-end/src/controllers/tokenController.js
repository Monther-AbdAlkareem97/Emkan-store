import { generateToken } from "../utils/generateToken.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const refreshAccessToken = async (req, res) => {
  try {
    // 1. لا تقبل الريفريش توكن إلا من الكوكيز فقط
    const refreshToken = req.cookies && req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "يرجى تسجيل الدخول مرة أخرى" });
    }
    // 2. تحقق من صحة التوكن
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "ريفريش توكن غير صالح أو منتهي" });
    }
    // 3. تحقق من وجود المستخدم والتوكن في قاعدة البيانات
    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: "جلسة غير صالحة، يرجى تسجيل الدخول مجدداً" });
    }
    // 4. أنشئ access token جديد فقط
    const accessToken = generateToken(user);
    return res.json({ token: accessToken });
  } catch (err) {
    return res.status(401).json({ message: "فشل تجديد التوكن", error: err.message });
  }
};
