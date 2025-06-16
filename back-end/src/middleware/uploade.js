import multer from "multer";
import path from "path";

// إعداد مكان حفظ الصور
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads"); // تأكد أن المجلد موجود
  },
  filename: function (req, file, cb) {
    // إزالة أي رموز أو سلاشات أو مسافات من اسم الملف الأصلي
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "");
    const uniqueName = Date.now() + "-" + cleanName;
    cb(null, uniqueName);
  },
});

// فلترة الملفات – فقط الصور
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("فقط الصور مسموح بها"), false);
  }
};

const upload = multer({ storage, fileFilter });

export default upload;
