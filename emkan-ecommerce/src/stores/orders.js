import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";

export const useOrdersStore = defineStore("orders", () => {
  const orders = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // جلب جميع الطلبات (للأدمن)
  const fetchAllOrders = async () => {
    loading.value = true;
    error.value = null;
    try {
      const res = await axios.get("http://localhost:5000/api/orders/all", {
        withCredentials: true,
      });
      orders.value = res.data;
    } catch (err) {
      error.value = err.response?.data?.message || err.message;
    } finally {
      loading.value = false;
    }
  };

  // جلب طلبات المستخدم الحالي
  const fetchUserOrders = async () => {
    loading.value = true;
    error.value = null;
    try {
      const res = await axios.get("http://localhost:5000/api/orders/my", {
        withCredentials: true,
      });
      orders.value = res.data;
    } catch (err) {
      error.value = err.response?.data?.message || err.message;
    } finally {
      loading.value = false;
    }
  };

  // إلغاء الطلب من قبل المستخدم
  const cancelOrderByUser = async (orderId) => {
    loading.value = true;
    error.value = null;
    try {
      await axios.post(
        "http://localhost:5000/api/orders/cancel",
        { orderId },
        { withCredentials: true }
      );
      await fetchUserOrders();
    } catch (err) {
      error.value = err.response?.data?.message || err.message;
    } finally {
      loading.value = false;
    }
  };

  return {
    orders,
    loading,
    error,
    fetchAllOrders,
    fetchUserOrders,
    cancelOrderByUser,
  };
});
