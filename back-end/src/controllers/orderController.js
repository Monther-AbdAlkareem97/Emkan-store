import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { sendEmail } from "../utils/sendEmail.js";
import { emitAdminNotification } from "../utils/socket.js";
import { createSalesMovementOnOrderConfirmation } from "./salesMovementController.js";

export const createOrder = async (req, res) => {
  const callId = `ORDER_${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 7)}`;
  console.log(
    `[${callId}] CREATE_ORDER_START - User: ${
      req.user?.userId
    }, Timestamp: ${new Date().toISOString()}`
  );

  try {
    const userId = req.user.userId;
    // تحقق من نوع المستخدم
    const foundUser = await User.findById(userId);
    if (foundUser && foundUser.role === "admin") {
      return res.status(403).json({ message: "لا يمكن للأدمن إنشاء طلبات." });
    }

    const { items, notes } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "لا يوجد منتجات في الطلب" });
    }

    const productIds = items.map((item) => item.product);
    const productsFromDB = await Product.find({
      _id: { $in: productIds },
    }).select("name quantity reserved offer imageCover price");

    const productDataForOrderProcessing = new Map(
      productsFromDB.map((p) => [
        p._id.toString(),
        {
          _id: p._id,
          name: p.name,
          price: p.price,
          imageCover: p.imageCover,
          temp_normal_reserved_for_this_order: 0,
          temp_discount_reserved_for_this_order: 0,
          db_offer_active: p.offer?.active || false,
          db_offer_discountValue: p.offer?.discountValue || 0,
          db_offer_discountQuantity: p.offer?.discountQuantity || 0,
          db_offer_discountReserved: p.offer?.discountReserved || 0,
        },
      ])
    );

    let totalAmount = 0;
    const orderItemsForDB = [];

    for (const item of items) {
      const currentProductState = productDataForOrderProcessing.get(
        item.product.toString()
      );
      if (!currentProductState) {
        throw new Error(
          `المنتج بالمعرف ${item.product} غير موجود في قاعدة البيانات.`
        );
      }

      let discountedToReserveThisItem = 0;
      let normalToReserveThisItem = 0;

      const offerIsValid =
        currentProductState.db_offer_active &&
        currentProductState.db_offer_discountQuantity -
          currentProductState.db_offer_discountReserved -
          currentProductState.temp_discount_reserved_for_this_order >
          0;

      const calculatedOfferPrice = offerIsValid
        ? Math.round(
            currentProductState.price -
              (currentProductState.price *
                (currentProductState.db_offer_discountValue || 0)) /
                100
          )
        : null;

      const isActuallyDiscounted =
        offerIsValid &&
        calculatedOfferPrice !== null &&
        item.price === calculatedOfferPrice;

      if (isActuallyDiscounted) {
        discountedToReserveThisItem = item.quantity;
      } else {
        normalToReserveThisItem = item.quantity;
      }

      totalAmount += item.price * item.quantity;

      orderItemsForDB.push({
        product: currentProductState._id,
        name: item.name || currentProductState.name,
        image: currentProductState.imageCover,
        price: item.price,
        quantity: item.quantity,
        isDiscounted: item.isDiscounted, // استخدم القيمة من السلة مباشرة
      });

      if (isActuallyDiscounted) {
        currentProductState.temp_discount_reserved_for_this_order +=
          item.quantity;
      } else {
        currentProductState.temp_normal_reserved_for_this_order +=
          item.quantity;
      }
    }

    const bulkUpdateOperations = [];
    for (const [
      productIdStr,
      productState,
    ] of productDataForOrderProcessing.entries()) {
      const incOperations = {};
      if (productState.temp_normal_reserved_for_this_order > 0) {
        incOperations.reserved =
          productState.temp_normal_reserved_for_this_order;
      }
      if (productState.temp_discount_reserved_for_this_order > 0) {
        incOperations["offer.discountReserved"] =
          productState.temp_discount_reserved_for_this_order;
      }
      if (Object.keys(incOperations).length > 0) {
        bulkUpdateOperations.push({
          updateOne: {
            filter: { _id: productState._id },
            update: { $inc: incOperations },
          },
        });
      }
    }

    const order = await Order.create({
      user: userId,
      items: orderItemsForDB,
      totalAmount,
      status: "awaiting_review",
      paymentMethod: "bank_transfer",
      notes: notes || "",
    });

    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: "طلب جديد في انتظار المراجعة",
      text: `هناك طلب جديد من المستخدم ${userId} بحاجة للمراجعة.`,
    });

    const userInfo = await User.findById(userId);
    emitAdminNotification({
      type: "new_order",
      userId,
      orderId: order._id,
      message: `طلب جديد من ${userInfo?.name || "مستخدم"} (${
        userInfo?.phone || "بدون رقم"
      }) بحاجة للمراجعة.`,
    });

    res.status(201).json({ message: "تم إنشاء الطلب بنجاح", order });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const approveOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId).populate("items.product");
    if (!order) return res.status(404).json({ message: "الطلب غير موجود" });
    if (order.status !== "awaiting_review") {
      return res
        .status(400)
        .json({ message: "لا يمكن الموافقة على هذا الطلب في حالته الحالية" });
    }
    order.status = "completed";
    order.paymentStatus = "paid";
    await order.save();

    for (const item of order.items) {
      const toDeduct = item.quantity;
      const product = await Product.findById(item.product._id);
      if (!product) continue;

      if (item.isDiscounted) {
        // بيع مخفض: خصم من discountQuantity و discountReserved فقط
        product.offer.discountQuantity = Math.max(
          0,
          (product.offer.discountQuantity || 0) - toDeduct
        );
        product.offer.discountReserved = Math.max(
          0,
          (product.offer.discountReserved || 0) - toDeduct
        );
        product.markModified("offer");
      } else {
        // بيع عادي: خصم من quantity و reserved فقط
        product.quantity = Math.max(0, (product.quantity || 0) - toDeduct);
        product.reserved = Math.max(0, (product.reserved || 0) - toDeduct);
      }
      await product.save();
    }

    try {
      await createSalesMovementOnOrderConfirmation(order._id);
    } catch (salesMovementError) {
      console.error("خطأ في تسجيل حركة المبيعات:", salesMovementError);
    }
    res.json({ message: "تمت الموافقة على الطلب وتحديث المخزون.", order });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "الطلب غير موجود" });
    }

    if (order.status !== "awaiting_review") {
      return res
        .status(400)
        .json({ message: "لا يمكن إلغاء هذا الطلب في حالته الحالية" });
    }

    const bulkUpdateOperations = order.items.map((item) => {
      const incUpdate = {};
      if (item.isDiscounted) {
        incUpdate["offer.discountReserved"] = -item.quantity;
      } else {
        incUpdate["reserved"] = -item.quantity;
      }
      return {
        updateOne: {
          filter: { _id: item.product },
          update: { $inc: incUpdate },
        },
      };
    });

    if (bulkUpdateOperations.length > 0) {
      await Product.bulkWrite(bulkUpdateOperations);
    }

    // حدد الحالة حسب من قام بالإلغاء
    if (req.body.byAdmin) {
      order.status = "cancelled_by_admin";
    } else {
      order.status = "cancelled_by_user";
    }
    await order.save();

    res.json({ message: "تم إلغاء الطلب وإرجاع الكميات المحجوزة" });
  } catch (err) {
    console.error("Error in cancelOrder:", err);
    res.status(400).json({ message: err.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("user").sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// جلب جميع طلبات مستخدم معيّن
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user?.userId || req.params.userId;
    if (!userId)
      return res.status(400).json({ message: "معرّف المستخدم غير موجود" });
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
