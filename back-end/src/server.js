import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
// استيراد راوتر المصادقة
import authRoutes from "./routes/authRoutes.js";
import tokenRoutes from "./routes/tokenRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import salesMovementRoutes from "./routes/salesMovementRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { setupSocket } from "./utils/socket.js";

// ✅ الطريقة الصحيحة لتعريف __dirname في ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// تهيئة متغيرات البيئة
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// الاتصال بقاعدة البيانات
connectDB();

// إعدادات الميدل وير
app.use(
  cors({
    origin: "http://localhost:8080", // عدل البورت إذا كان مختلفاً
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// ✅ استضافة مجلد uploads بشكل صحيح باستخدام __dirname الجديد
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

// نقطة اختبار بسيطة
app.get("/", (req, res) => {
  res.send("خادم امكان يعمل بنجاح!");
});

// استخدام الراوترات
app.use("/api/auth", authRoutes);
app.use("/api/token", tokenRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/sales-movements", salesMovementRoutes);
app.use("/api/reports", reportRoutes);

// تشغيل السيرفر مع معالجة الأخطاء
const startServer = async () => {
  try {
    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    // تفعيل الويب سوكت
    setupSocket(server);
  } catch (err) {
    console.error("فشل تشغيل السيرفر:", err);
  }
};

startServer();
