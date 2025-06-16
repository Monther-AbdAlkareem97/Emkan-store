import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: { type: String, required: true }, // اسم المنتج وقت الطلب
  image: { type: String }, // صورة المنتج وقت الطلب
  price: { type: Number, required: true }, // سعر الوحدة وقت الطلب
  quantity: { type: Number, required: true, min: 1 },
  isDiscounted: { type: Boolean, required: true, default: false }, // إضافة حقل لتحديد ما إذا كان المنتج مخفضًا
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: [
        "awaiting_review", // في انتظار المراجعة (بعد أن يؤكد المستخدم التحويل)
        "payment_confirmed", // تم تأكيد الدفع
        "processing", // جاري التجهيز
        "shipped", // تم الشحن
        "delivered", // تم التوصيل
        "completed", // Order is completed
        "cancelled_by_user", // ألغاه المستخدم
        "cancelled_by_admin", // ألغاه الأدمن
        "refunded", // تم إرجاع المبلغ
      ],
      default: "awaiting_review",
    },
    paymentMethod: {
      type: String,
      required: true,
      default: "bank_transfer", // تحويل بنكي
    },
    notes: { type: String }, // أي ملاحظات من المستخدم مع الطلب
  },
  { timestamps: true } // لإضافة createdAt و updatedAt تلقائيًا
);

export default mongoose.model("Order", orderSchema);
