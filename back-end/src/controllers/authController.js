import User from "../models/User.js";
import { generateToken, generateRefreshToken } from "../utils/generateToken.js";

// تسجيل مستخدم جديد
export const register = async (req, res) => {
  try {
    const { name, phone, password, address } = req.body;
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: "رقم الهاتف مستخدم بالفعل" });
    }
    // لا تشفر كلمة المرور هنا، فقط مررها كما هي وسيتم تشفيرها في pre-save hook
    const user = await User.create({
      name,
      phone,
      password,
      address,
    });
    res.status(201).json({
      message: "تم إنشاء الحساب بنجاح",
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        photo: user.photo,
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "حدث خطأ أثناء التسجيل", error: err.message });
  }
};

// تسجيل الدخول
export const login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ message: "بيانات الدخول غير صحيحة" });
    }
    // استخدم دالة matchPassword من الموديل
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "بيانات الدخول غير صحيحة" });
    }
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);
    // حفظ الريفريش توكن في قاعدة البيانات (اختياري)
    user.refreshToken = refreshToken;
    await user.save();
    // إرسال التوكنات في كوكيز محمية فقط
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 دقيقة
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 أيام
      path: "/", // أضف هذا السطر
    });
    res.json({
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        photo: user.photo,
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "حدث خطأ أثناء تسجيل الدخول", error: err.message });
  }
};

// تسجيل الخروج
export const logout = async (req, res) => {
  try {
    // استخراج التوكن من الكوكيز أو الهيدر
    let token;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    if (token) {
      // فك التوكن للحصول على userId
      const jwt = await import("jsonwebtoken");
      const decoded = jwt.default.verify(token, process.env.JWT_SECRET);
      if (decoded && decoded.userId) {
        await User.findByIdAndUpdate(decoded.userId, {
          $unset: { refreshToken: "" },
        });
      }
    }
  } catch (err) {
    // يمكن تجاهل الخطأ هنا حتى لا يمنع تسجيل الخروج
  }
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/", // أضف هذا السطر
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/", // أضف هذا السطر
  });
  res.json({ message: "تم تسجيل الخروج بنجاح" });
};

// جلب جميع المستخدمين (مثال لصلاحية الأدمن)
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password -refreshToken");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "حدث خطأ", error: err.message });
  }
};
