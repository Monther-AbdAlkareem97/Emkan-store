import SalesMovement from "../models/SalesMovement.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

// دالة لإنشاء حركة مبيعات جديدة عند تأكيد الطلب
export const createSalesMovementOnOrderConfirmation = async (orderId) => {
  try {
    const order = await Order.findById(orderId).populate("items.product");
    if (!order || order.status !== "completed") {
      // افترض أن الطلب يجب أن يكون مكتملًا
      // يمكن تعديل هذا الشرط حسب منطق التطبيق
      console.log(
        `Order ${orderId} not found or not completed for sales movement creation.`
      );
      return;
    }

    const items = order.items.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
      priceAtSale: item.price,
      totalAmount: item.quantity * item.price,
    }));
    const totalAmount = items.reduce((sum, item) => sum + item.totalAmount, 0);
    const salesMovement = new SalesMovement({
      user: order.user,
      order: order._id,
      items,
      totalAmount, // الحل هنا
    });
    await salesMovement.save();
    console.log(`Sales movement created successfully for order ${orderId}`);
  } catch (error) {
    console.error("Error creating sales movement:", error);
    // لا يجب إيقاف عملية تأكيد الطلب بسبب خطأ في تسجيل حركة المبيعات
    // يمكن تسجيل الخطأ للمراجعة لاحقًا
  }
};

// دالة لجلب كل حركات المبيعات (يمكن تقييدها للمشرفين فقط)
export const getAllSalesMovements = async (req, res) => {
  try {
    const salesMovements = await SalesMovement.find()
      .populate("user", "name email") // جلب اسم المستخدم وبريده الإلكتروني
      .populate("product", "name") // جلب اسم المنتج
      .populate("order", "orderNumber"); // جلب رقم الطلب أو أي معرّف آخر للطلب

    res.status(200).json(salesMovements);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching sales movements",
      error: error.message,
    });
  }
};

// دالة لجلب حركات المبيعات لمنتج معين
export const getSalesMovementsByProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    const salesMovements = await SalesMovement.find({ product: productId })
      .populate("user", "name email")
      .populate("order", "orderNumber");

    if (!salesMovements.length) {
      return res
        .status(404)
        .json({ message: "No sales movements found for this product" });
    }
    res.status(200).json(salesMovements);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching sales movements for product",
      error: error.message,
    });
  }
};

// دالة لجلب حركات المبيعات لمستخدم معين
export const getSalesMovementsByUser = async (req, res) => {
  try {
    // نفترض أن معرف المستخدم متاح في req.user بعد المصادقة
    // أو يمكن تمريره كـ req.params.userId إذا كان مشرفًا يطلب البيانات
    const userId = req.user ? req.user.id : req.params.userId;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const salesMovements = await SalesMovement.find({ user: userId })
      .populate("product", "name")
      .populate("order", "orderNumber");

    if (!salesMovements.length) {
      return res
        .status(404)
        .json({ message: "No sales movements found for this user" });
    }
    res.status(200).json(salesMovements);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching sales movements for user",
      error: error.message,
    });
  }
};

// دالة لجلب حركات المبيعات لطلب معين
export const getSalesMovementsByOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const salesMovements = await SalesMovement.find({ order: orderId })
      .populate("user", "name email")
      .populate("product", "name");

    if (!salesMovements.length) {
      return res
        .status(404)
        .json({ message: "No sales movements found for this order" });
    }
    res.status(200).json(salesMovements);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching sales movements for order",
      error: error.message,
    });
  }
};
