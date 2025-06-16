import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// Get user's cart
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.userId }).populate(
      "items.product"
    );
    if (!cart) return res.json({ items: [] });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: "خطأ في جلب السلة", error: err.message });
  }
};

// Add item to cart
export const addToCart = async (req, res) => {
  try {
    console.log("addToCart req.body:", req.body);
    const { productId, quantity, price, isDiscounted } = req.body;

    // تحقق من صحة quantity
    if (!Number.isInteger(quantity) || quantity < 1) {
      console.log("خطأ: quantity غير صحيح", { quantity, reqBody: req.body });
      return res.status(400).json({
        message:
          "الكمية المطلوبة غير صحيحة. يجب أن تكون رقمًا صحيحًا أكبر من 0.",
      });
    }

    // جلب المنتج
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "المنتج غير موجود" });

    // جلب السلة أو إنشاؤها
    let cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) {
      cart = new Cart({ user: req.user.userId, items: [] });
    }

    const finalPrice = price;
    const finalIsDiscounted = isDiscounted;
    const originalPrice = finalIsDiscounted ? product.price : null;

    // تحقق من الكمية المتاحة حسب حالة التخفيض
    let available = 0;
    if (
      finalIsDiscounted &&
      product.offer &&
      product.offer.active &&
      product.offer.discountQuantity > 0
    ) {
      // الكمية المتاحة فقط من الكمية المخفضة
      available = product.offer.discountQuantity - (product.reserved || 0);
    } else {
      // الكمية المتاحة فقط من الكمية الأصلية
      available = (product.quantity || 0) - (product.reserved || 0);
    }
    // البحث عن عنصر موجود بنفس المنتج والسعر وحالة التخفيض
    const existingItem = cart.items.find(
      (item) =>
        item.product.equals(productId) &&
        item.price === finalPrice &&
        item.isDiscounted === finalIsDiscounted
    );
    if (existingItem) {
      available += existingItem.quantity; // الكمية المحجوزة بالفعل لهذا المستخدم
    }
    // تحقق صارم: لا تسمح أبداً بتجاوز الكمية الأصلية أو الكمية المخفضة
    const totalRequested =
      (existingItem ? existingItem.quantity : 0) + quantity;
    if (totalRequested > available) {
      return res.status(400).json({
        message: `الكمية المطلوبة (${totalRequested}) غير متوفرة لهذا المنتج. الكمية المتاحة: ${available}`,
      });
    }

    // تحديث السلة
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        quantity,
        price: finalPrice,
        isDiscounted: finalIsDiscounted,
        originalPrice: originalPrice,
      });
    }

    await cart.save();

    // Populate product details before sending response
    await cart.populate("items.product");
    res.json(cart);
  } catch (err) {
    res.status(500).json({
      message: "خطأ في إضافة المنتج للسلة",
      error: err.message,
    });
  }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
  try {
    const { cartItemId } = req.body; // Changed from productId to cartItemId
    const cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) return res.status(404).json({ message: "السلة غير موجودة" });

    // Find the index of the item to remove by its _id
    const itemIndex = cart.items.findIndex((item) =>
      item._id.equals(cartItemId)
    );

    if (itemIndex > -1) {
      cart.items.splice(itemIndex, 1); // Remove the item by index
    } else {
      return res.status(404).json({ message: "العنصر غير موجود في السلة" });
    }

    await cart.save();
    // Populate product details before sending response
    await cart.populate("items.product");
    res.json(cart);
  } catch (err) {
    res
      .status(500)
      .json({ message: "خطأ في حذف المنتج من السلة", error: err.message });
  }
};

// Update item quantity
export const updateCartItem = async (req, res) => {
  try {
    const { cartItemId, quantity } = req.body; // Changed from productId to cartItemId
    const cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) return res.status(404).json({ message: "السلة غير موجودة" });

    const itemIndex = cart.items.findIndex((item) =>
      item._id.equals(cartItemId)
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "العنصر غير موجود في السلة" });
    }

    const item = cart.items[itemIndex];
    const product = await Product.findById(item.product);
    if (!product) {
      return res.status(404).json({ message: "المنتج غير موجود" });
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      // احسب الفرق
      const diff = quantity - item.quantity;
      // نقارن الكمية الجديدة الكلية المطلوبة في السلة مع الكمية الكلية للمنتج
      if (quantity > (product.quantity || 0)) {
        return res.status(400).json({
          message: `الكمية المطلوبة (${quantity}) غير متوفرة لهذا المنتج. الكمية الكلية في المخزون: ${product.quantity}`,
        });
      }
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();
    // Populate product details before sending response
    await cart.populate("items.product");
    res.json(cart);
  } catch (err) {
    res
      .status(500)
      .json({ message: "خطأ في تحديث الكمية", error: err.message });
  }
};

// تفريغ السلة بعد الشراء
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.userId });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json({ message: "تم تفريغ السلة" });
  } catch (err) {
    res.status(500).json({ message: "خطأ في تفريغ السلة", error: err.message });
  }
};

// عند تأكيد الطلب أو إلغائه، يتم تصفير reserved تلقائياً
// سكريبت تصفير reserved لكل المنتجات (يمكن وضعه في ملف صيانة أو تشغيله مرة واحدة عند الحاجة)
// مثال (يمكنك نسخه وتشغيله في mongo shell أو سكريبت Node.js):
// await Product.updateMany({}, { $set: { reserved: 0 } });
