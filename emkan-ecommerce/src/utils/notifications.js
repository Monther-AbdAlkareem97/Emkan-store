// utils/notifications.js
import { ref } from "vue";
import { useOrdersStore } from "@/stores/orders";

export const notifications = ref([]);
export const notificationCount = ref(0);

export function updateNotificationsFromOrders(ordersList) {
  const orders = ordersList || useOrdersStore().orders;
  const newOrders = Array.isArray(orders)
    ? orders.filter((order) => order.status === "awaiting_review")
    : [];
  notifications.value = newOrders.map((order) => ({
    id: order._id,
    message: `طلب جديد من ${order.user?.name || "مستخدم"} (${
      order.user?.phone || "بدون رقم"
    }) بحاجة للمراجعة.`,
    time: new Date(order.createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  }));
  notificationCount.value = notifications.value.length;
}
