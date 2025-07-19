import jwt from "jsonwebtoken";

// التحقق من التوكن
export const auth = async (req, res, next) => {
  let token;
  // أولاً: جرب الهيدر
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies && req.cookies.token) {
    // ثانياً: جرب الكوكيز
    token = req.cookies.token;
  }
  if (!token) {
    return res.status(401).json({ message: "غير مصرح" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "توكن غير صالح" });
  }
};

// السماح للأدمن فقط

export const adminOnly = async (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "مسموح للأدمن فقط" });
  }
  next();
};
