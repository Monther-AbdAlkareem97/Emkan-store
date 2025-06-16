<template>
  <section
    class="min-h-[70vh] w-4/5 m-auto flex flex-col items-center justify-center py-16 animate-fadeIn"
  >
    <h2 class="text-2xl md:text-3xl font-extrabold text-blue-700 mb-6">
      طلباتي
    </h2>
    <div
      class="w-full max-w-2xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 flex flex-col gap-6"
    >
      <div
        v-if="ordersStore.orders.length === 0"
        class="text-center text-gray-500 py-8"
      >
        لا توجد طلبات حتى الآن.
      </div>
      <div v-else>
        <div
          v-for="(order, idx) in ordersStore.orders"
          :key="order._id"
          class="border-b border-blue-100 py-4 flex flex-col gap-2"
        >
          <div class="flex justify-between items-center">
            <span class="font-bold text-blue-700">طلب رقم: {{ idx + 1 }}</span>
            <span class="text-sm text-gray-500">
              {{ new Date(order.createdAt).toLocaleDateString("ar-EG") }}
            </span>
          </div>
          <div
            class="flex flex-col md:flex-row md:justify-between md:items-center gap-2"
          >
            <span class="text-gray-700"
              >الحالة:
              <span
                :class="
                  order.status === 'completed'
                    ? 'text-green-600'
                    : order.status === 'awaiting_review'
                    ? 'text-yellow-600'
                    : 'text-red-600'
                "
              >
                {{
                  order.status === "completed"
                    ? "مكتمل"
                    : order.status === "awaiting_review"
                    ? "قيد المراجعة"
                    : order.status === "cancelled_by_user" &&
                      authStore.user?.name
                    ? `ملغي من ${authStore.user.name}`
                    : order.status === "cancelled_by_admin"
                    ? "ملغي من الأدمن"
                    : order.status
                }}
              </span>
            </span>
            <span class="text-gray-700"
              >المجموع:
              <span class="font-bold">{{ order.totalAmount }} د.ل</span></span
            >
            <button
              v-if="order.status === 'awaiting_review'"
              @click="cancelOrder(order._id)"
              class="mt-2 md:mt-0 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              إلغاء الطلب
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted } from "vue";
import { useOrdersStore } from "@/stores/orders";
import { useAuthStore } from "@/stores/auth";

const ordersStore = useOrdersStore();
const authStore = useAuthStore();

onMounted(async () => {
  // جلب الطلبات الخاصة بالمستخدم الحالي
  await ordersStore.fetchUserOrders();
});

const cancelOrder = async (orderId) => {
  if (confirm("هل أنت متأكد من إلغاء الطلب؟")) {
    await ordersStore.cancelOrderByUser(orderId);
  }
};
</script>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
