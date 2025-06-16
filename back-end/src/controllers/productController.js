import Product from "../models/Product.js";
import mongoose from "mongoose";

const createProduct = async (req, res) => {
  try {
    const { name, description, price, quantity, category } = req.body;
    const image = req.file ? `uploads/${req.file.filename}` : null;

    const newProduct = await Product.create({
      name,
      description,
      price,
      quantity,
      category,
      image,
    });

    res.status(201).json(newProduct);
  } catch (error) {
    console.error("خطأ في إنشاء المنتج:", error);
    res.status(500).json({ message: "فشل في إنشاء المنتج" });
  }
};

const getProducts = async (req, res) => {
  const products = await Product.find().populate("category");
  res.json(products);
};

const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category");
  if (!product) {
    return res.status(404).json({ message: "المنتج غير موجود" });
  }
  res.json(product);
};

const allowedFields = [
  "name",
  "description",
  "price",
  "quantity",
  "category",
  "image",
];

const updateProduct = async (req, res) => {
  try {
    // تحقق من صحة ObjectId
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "معرّف المنتج غير صالح" });
    }

    // تحقق من وجود المنتج أولاً
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ message: "المنتج غير موجود" });
    }

    // بناء كائن التحديث فقط من الحقول المسموح بها
    const updateData = {};
    allowedFields.forEach((field) => {
      if (field in req.body) {
        updateData[field] = req.body[field];
      }
    });

    // معالجة رفع صورة جديدة
    if (req.file) {
      updateData.image = `uploads/${req.file.filename}`;
    }

    // تحديث المنتج
    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedProduct) {
      return res.status(404).json({ message: "المنتج غير موجود بعد التحديث" });
    }

    res.json(updatedProduct);
  } catch (error) {
    // معالجة جميع الأخطاء الممكنة
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: "خطأ في البيانات المدخلة", error: error.message });
    }
    res
      .status(500)
      .json({ message: "حدث خطأ أثناء تحديث المنتج", error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "المنتج غير موجود" });
    }
    res.json({ message: "تم الحذف بنجاح" });
  } catch (error) {
    res.status(500).json({ message: "خطأ في حذف المنتج" });
  }
};

// إضافة أو تحديث تخفيض على منتج
const setProductOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const { discountValue, discountQuantity, active } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "معرّف المنتج غير صالح" });
    }
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "المنتج غير موجود" });
    }
    // لا تعدل الكمية الأصلية إطلاقاً عند تفعيل أو إلغاء العرض
    // استرجاع الكمية الأصلية أولاً إذا كان هناك عرض سابق
    if (product.offer && product.offer.discountQuantity > 0 && product.offer.active) {
      product.quantity += product.offer.discountQuantity;
    }
    // إذا كان العرض الجديد مفعل (active === true) وبه كمية مخفضة
    if (active === true && discountQuantity > 0) {
      product.quantity = Math.max(0, product.quantity - discountQuantity);
    }
    // إذا كان العرض غير مفعل (active === false) أو تم تصفير الكمية، لا تخصم شيء (الكمية رجعت فوق)
    product.offer = {
      discountValue: discountValue || 0,
      discountQuantity: discountQuantity || 0,
      active: active !== undefined ? active : true,
    };
    await product.save();
    res.json(product);
  } catch (error) {
    res
      .status(500)
      .json({ message: "حدث خطأ أثناء تحديث التخفيض", error: error.message });
  }
};

export default {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  setProductOffer, // إضافة الدالة الجديدة
};
