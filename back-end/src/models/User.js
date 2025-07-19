import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    address: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    refreshToken: { type: String }, // إضافة حقل الريفريش توكن
    photo: { type: String, default: "/profile.jpg" }, // صورة افتراضية ويمكن تعديلها لاحقاً
  },
  { timestamps: true }
);

// تشفير كلمة المرور قبل الحفظ
userSchema.pre("save", async function (next) {
  // اذا المستخدم غير بياناته  الاخرى مثل صوره  ...الخ لا تشفر كلمة المرور مرة اخرى لانها مشفره بالفعل
  //هنا النفي عشان  طبيعة ال if تنفذ الشرط اذا كان صحيح لذا يجب نفي الحاله التي نريد التشفير فيه
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// دالة لمقارنة كلمة المرور
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// إخفاء كلمة المرور والريفريش توكن عند التحويل إلى JSON
// هذا مهم لحماية البيانات الحساسة لكي تصل للفرونت اند بيانات غير مهمه
userSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret.password;
    delete ret.refreshToken;
    return ret;
  },
});

const User = mongoose.model("User", userSchema);

export default User;
