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
        isDiscounted: isActuallyDiscounted,
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

    if (bulkUpdateOperations.length > 0) {
      await Product.bulkWrite(bulkUpdateOperations);
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

    const user = await User.findById(userId);
    emitAdminNotification({
      type: "new_order",
      userId,
      orderId: order._id,
      message: `طلب جديد من ${user?.name || "مستخدم"} (${
        user?.phone || "بدون رقم"
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
      const product = await Product.findById(item.product._id || item.product);
      if (!product) continue;

      console.log(
        `Processing product: ${product.name}, Item ID: ${item._id}, Is Discounted: ${item.isDiscounted}`
      );
      if (product.offer) {
        console.log(
          `Initial product offer state for ${product.name}: quantity=${product.offer.discountQuantity}, reserved=${product.offer.discountReserved}, active=${product.offer.active}`
        );
      } else {
        console.log(`Product ${product.name} has no offer object.`);
      }
      console.log(`Item quantity for ${product.name}: ${item.quantity}`);

      if (item.isDiscounted && product.offer && product.offer.active) {
        console.log(`Applying discount logic for ${product.name}`);
        const toDeduct = item.quantity;

        console.log(
          `Before discount: DQ=${product.offer.discountQuantity}, DR=${product.offer.discountReserved}`
        );
        if (product.offer.discountQuantity >= toDeduct) {
          product.offer.discountQuantity -= toDeduct;
        } else {
          product.offer.discountQuantity = 0;
        }

        if (product.offer.discountReserved >= toDeduct) {
          product.offer.discountReserved -= toDeduct;
        } else {
          product.offer.discountReserved = 0;
        }
        console.log(
          `After discount: DQ=${product.offer.discountQuantity}, DR=${product.offer.discountReserved}`
        );

        product.markModified("offer");
        await product.save();
        console.log(`Product ${product.name} offer saved.`);
      } else {
        console.log(
          `Skipping discount logic for ${product.name}. isDiscounted=${
            item.isDiscounted
          }, offerExists=${!!product.offer}, offerActive=${
            product.offer?.active
          }`
        );
        const toDeduct = Math.min(product.reserved || 0, item.quantity);
        product.quantity = Math.max(0, (product.quantity || 0) - toDeduct);
        product.reserved = Math.max(0, (product.reserved || 0) - toDeduct);
        await product.save();
      }
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
    const { orderId, byAdmin } = req.body;
    const order = await Order.findById(orderId).populate("items.product"); // Populate product details
    if (!order) return res.status(404).json({ message: "الطلب غير موجود" });
    if (
      order.status === "cancelled_by_user" ||
      order.status === "cancelled_by_admin"
    ) {
      return res.status(400).json({ message: "تم إلغاء الطلب مسبقاً" });
    }

    for (const item of order.items) {
      const product = item.product; // Product is already populated
      if (!product) continue;

      if (byAdmin) {
        // إلغاء من الأدمن: تصفير الحجوزات فقط
        if (item.isDiscounted && product.offer && product.offer.active) {
          product.offer.discountReserved = 0;
          product.markModified("offer");
        } else {
          product.reserved = 0;
        }
        // لا يتم إرجاع الكمية إلى المخزون في حالة إلغاء الأدمن
      } else {
        // إلغاء من المستخدم: إرجاع الكميات المحجوزة للمخزون وتحديث الحجوزات
        if (item.isDiscounted && product.offer && product.offer.active) {
          product.offer.discountQuantity =
            (product.offer.discountQuantity || 0) + item.quantity;
          product.offer.discountReserved = Math.max(
            0,
            (product.offer.discountReserved || 0) - item.quantity
          );
          product.markModified("offer");
        } else {
          product.quantity = (product.quantity || 0) + item.quantity;
          product.reserved = Math.max(
            0,
            (product.reserved || 0) - item.quantity
          );
        }
      }
      await product.save();
    }

    order.status = byAdmin ? "cancelled_by_admin" : "cancelled_by_user";
    await order.save();
    res.json({ message: "تم إلغاء الطلب" });
  } catch (err) {
    console.error("Error in cancelOrder:", err); // Log the error
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
