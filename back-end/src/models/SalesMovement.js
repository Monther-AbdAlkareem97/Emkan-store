import mongoose from "mongoose";

const salesMovementItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: { type: Number, required: true },
  priceAtSale: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
});

const salesMovementSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    items: [salesMovementItemSchema],
    totalAmount: {
      type: Number,
      required: true,
    },
    transactionDate: {
      type: Date,
      default: Date.now,
    },
    // يمكن إضافة حقول أخرى مثل نوع الحركة (بيع، إرجاع) إذا لزم الأمر في المستقبل
    // type: {
    //     type: String,
    //     enum: ['sale', 'return'],
    //     default: 'sale'
    // }
  },
  { timestamps: true }
);

salesMovementSchema.pre("save", function (next) {
  if (this.isNew || this.isModified("items")) {
    this.totalAmount = this.items.reduce(
      (sum, item) => sum + item.totalAmount,
      0
    );
  }
  next();
});

const SalesMovement = mongoose.model("SalesMovement", salesMovementSchema);

export default SalesMovement;
