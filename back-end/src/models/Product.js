import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  reserved: { type: Number, default: 0 }, // <-- الحقل الجديد
  description: { type: String },
  image: { type: String }, // رابط أو اسم صورة المنتج
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  }, // فئة المنتج
  offer: {
    discountValue: { type: Number, default: 0 }, // نسبة الخصم
    discountQuantity: { type: Number, default: 0 }, // الكمية المخفضة
    discountReserved: { type: Number, default: 0 }, // الكمية المحجوزة من المخفض
    active: { type: Boolean, default: false }, // حالة التفعيل
  },
});

export default mongoose.model("Product", productSchema);
