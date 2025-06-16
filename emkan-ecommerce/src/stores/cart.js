import { defineStore } from "pinia";
import { ref, computed } from "vue";
import axios from "axios";

export const useCartStore = defineStore("cart", () => {
  const cart = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // جلب بيانات السلة من الباك اند الحقيقي
  const fetchCart = async () => {
    loading.value = true;
    error.value = null;
    try {
      const res = await axios.get("http://localhost:5000/api/cart", {
        withCredentials: true,
      });
      cart.value = res.data.items || [];
    } catch (err) {
      error.value = err.response?.data?.message || err.message;
    } finally {
      loading.value = false;
    }
  };

  // إضافة منتج للسلة (باك اند)
  const addToCart = async (
    productId,
    quantity = 1,
    price = null,
    isDiscounted = false
  ) => {
    try {
      // لا حاجة للتحقق المحلي هنا، الباك اند سيقوم بذلك ويعيد السلة المحدثة
      const res = await axios.post(
        "http://localhost:5000/api/cart/add",
        { productId, quantity, price, isDiscounted }, // Send price and isDiscounted
        { withCredentials: true }
      );
      cart.value = res.data.items;
    } catch (err) {
      error.value = err.response?.data?.message || err.message;
    }
  };

  // حذف منتج من السلة
  const removeFromCart = async (item) => {
    try {
      // نستخدم cartItemId وهو _id الخاص بالعنصر داخل السلة
      const cartItemId = item._id;
      if (!cartItemId) {
        console.error("Cart item ID is missing for removal.", item);
        error.value = "خطأ: معرف عنصر السلة مفقود";
        return;
      }
      const res = await axios.post(
        "http://localhost:5000/api/cart/remove",
        { cartItemId }, // Send cartItemId
        { withCredentials: true }
      );
      cart.value = res.data.items;
    } catch (err) {
      error.value = err.response?.data?.message || err.message;
    }
  };

  // تحديث كمية منتج
  const updateQuantity = async (item, quantity) => {
    try {
      // نستخدم cartItemId وهو _id الخاص بالعنصر داخل السلة
      const cartItemId = item._id;
      if (!cartItemId) {
        console.error("Cart item ID is missing for quantity update.", item);
        error.value = "خطأ: معرف عنصر السلة مفقود";
        return;
      }
      const res = await axios.post(
        "http://localhost:5000/api/cart/update",
        { cartItemId, quantity }, // Send cartItemId and new quantity
        { withCredentials: true }
      );
      cart.value = res.data.items;
    } catch (err) {
      error.value = err.response?.data?.message || err.message;
    }
  };

  // حساب إجمالي قيمة السلة
  const total = computed(() => {
    return cart.value.reduce((sum, item) => {
      return sum + (item.price ? Number(item.price) * item.quantity : 0);
    }, 0);
  });

  // إرسال الطلب للباك اند
  const submitOrder = async (notes) => {
    console.log(
      "cart.js: submitOrder called. Current cart length:",
      cart.value.length
    ); // <--- إضافة تسجيل
    if (cart.value.length === 0) {
      console.warn("cart.js: submitOrder - Cart is empty, throwing error."); // <--- إضافة تسجيل
      throw new Error("Cart is empty");
    }
    loading.value = true;
    error.value = null;
    try {
      const orderDetails = {
        items: cart.value.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.price,
          name: item.product.name,
          image: item.product.imageCover,
          isDiscounted: typeof item.isDiscounted === 'boolean' ? item.isDiscounted : false, // حماية إضافية
        })),
        totalAmount: total.value, // Use the computed total
        paymentMethod: "bank_transfer",
        notes: notes,
      };
      console.log(
        "cart.js: submitOrder - Order details prepared:",
        JSON.stringify(orderDetails)
      ); // <--- إضافة تسجيل

      const response = await axios.post(
        "http://localhost:5000/api/orders",
        orderDetails,
        {
          withCredentials: true,
        }
      );
      console.log(
        "cart.js: submitOrder - Order creation response status:",
        response.status
      ); // <--- إضافة تسجيل

      // اعتبر العملية ناجحة إذا كان كود الاستجابة 201 أو يوجد order في البيانات
      if (response.status === 201 || response.data.order) {
        console.log(
          "cart.js: submitOrder - Order successful, attempting to clear cart."
        ); // <--- إضافة تسجيل
        await axios.post(
          "http://localhost:5000/api/cart/clear",
          {},
          { withCredentials: true }
        );
        console.log(
          "cart.js: submitOrder - Backend cart cleared. Clearing local cart."
        ); // <--- إضافة تسجيل
        cart.value = [];
        console.log(
          "cart.js: submitOrder - Local cart cleared. Cart length:",
          cart.value.length
        ); // <--- إضافة تسجيل
        console.log("Order submitted successfully:", response.data.order);
      } else {
        console.warn(
          "cart.js: submitOrder - Order submission failed or response unexpected:",
          response
        ); // <--- إضافة تسجيل
        throw new Error(response.data.message || "Failed to submit order");
      }
      return response.data.order; // Return the created order
    } catch (err) {
      // Changed error variable name to avoid conflict with store's error ref
      console.error(
        "cart.js: submitOrder - Error submitting order:", // <--- إضافة تسجيل
        err.response ? err.response.data : err.message
      );
      error.value =
        err.response?.data?.message ||
        "Could not submit order. Please try again.";
      throw err; // Re-throw to be caught by the component
    } finally {
      console.log(
        "cart.js: submitOrder - Finally block. Loading set to false."
      ); // <--- إضافة تسجيل
      loading.value = false;
    }
  };

  // Helper to clear cart locally if needed, though submitOrder handles it on success.
  const clearCartLocally = () => {
    cart.value = [];
    // No cartId to clear here
  };

  const cartItems = computed(() => cart.value);

  return {
    cart,
    cartItems, // أضف هذا السطر
    loading,
    error,
    fetchCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    total,
    submitOrder, // Expose the new action
    clearCartLocally, // Expose the helper
  };
});
