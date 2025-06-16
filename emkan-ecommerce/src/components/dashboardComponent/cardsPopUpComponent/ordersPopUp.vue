<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
    @click.self="$emit('update:modelValue', false)"
  >
    <div
      class="relative bg-white rounded-3xl shadow-2xl border border-blue-100 p-6 w-full max-w-xl mx-4 animate-fade max-h-[80vh] overflow-y-auto"
    >
      <button
        class="absolute top-4 left-4 text-gray-400 hover:text-red-500 text-2xl transition-all duration-200 bg-gray-100 rounded-full p-2 shadow-md"
        @click="$emit('update:modelValue', false)"
      >
        <font-awesome-icon icon="xmark" />
      </button>
      <h2 class="text-2xl font-bold mb-6 text-center text-blue-700">الطلبات</h2>
      <div v-if="loading" class="text-center text-gray-500 py-10">
        جاري تحميل الطلبات...
      </div>
      <div v-else-if="error" class="text-center text-red-500 py-10">
        {{ error }}
      </div>
      <div
        v-else-if="filteredOrders.length === 0"
        class="text-center text-gray-500 py-10"
      >
        لا توجد طلبات جديدة حالياً.
      </div>
      <div
        v-for="order in filteredOrders"
        :key="order._id"
        class="mb-6 rounded-xl border border-blue-100 bg-blue-50/30 shadow-sm p-5"
      >
        <div
          class="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2"
        >
          <span class="font-bold text-blue-700 text-lg">
            {{ order.user?.name || "---" }}
          </span>
          <span class="text-gray-600 text-base">
            المجموع: <span class="font-bold">{{ order.totalAmount }} د.ل</span>
          </span>
          <span
            class="text-sm px-3 py-1 rounded-full font-bold"
            :class="
              order.status === 'payment_confirmed' ||
              order.status === 'completed'
                ? 'bg-green-100 text-green-700'
                : order.status === 'awaiting_review'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-gray-100 text-gray-700'
            "
          >
            {{
              order.status === "awaiting_review"
                ? "قيد المراجعة"
                : order.status === "payment_confirmed" ||
                  order.status === "completed"
                ? "تم التأكيد"
                : order.status
            }}
          </span>
        </div>
        <div class="mb-2">
          <span class="font-semibold text-gray-700">المنتجات:</span>
          <ul class="list-disc pl-6 text-sm mt-1">
            <li v-for="item in order.items" :key="item._id">
              {{ item.product?.name || item.name }} - الكمية:
              {{ item.quantity }}
            </li>
          </ul>
        </div>
        <div class="flex flex-wrap gap-2 justify-end mt-2">
          <button
            class="bg-green-500 text-white px-4 py-1 rounded-lg hover:bg-green-600 text-sm font-bold transition shadow"
            @click="confirmOrder(order._id)"
          >
            تأكيد
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount, computed } from "vue";
import axios from "axios";
import { useOrdersStore } from "@/stores/orders";
import { updateNotificationsFromOrders } from "@/utils/notifications";

const props = defineProps(["modelValue"]);
const emit = defineEmits(["update:modelValue"]);

const orders = ref([]);
const loading = ref(false);
const error = ref("");
const ordersStore = useOrdersStore();

async function fetchOrders() {
  loading.value = true;
  error.value = "";
  try {
    const res = await axios.get("http://localhost:5000/api/orders/all", {
      withCredentials: true,
    });
    orders.value = res.data || [];
  } catch (err) {
    error.value = err.response?.data?.message || err.message;
  } finally {
    loading.value = false;
  }
}

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      document.body.style.overflow = "hidden";
      fetchOrders();
    } else {
      document.body.style.overflow = "";
    }
  }
);

onBeforeUnmount(() => {
  document.body.style.overflow = "";
});

const filteredOrders = computed(() =>
  orders.value.filter((o) => o.status === "awaiting_review")
);

async function confirmOrder(id) {
  const order = orders.value.find((o) => o._id === id);
  if (!order) return;
  try {
    await axios.post(
      "http://localhost:5000/api/orders/approve",
      { orderId: id },
      { withCredentials: true }
    );
    order.status = "payment_confirmed";
    await ordersStore.fetchAllOrders();
    updateNotificationsFromOrders(ordersStore.orders);
  } catch (err) {
    alert(
      "حدث خطأ أثناء تأكيد الطلب: " +
        (err.response?.data?.message || err.message)
    );
  }
}
function deleteOrder(id) {
  const index = orders.value.findIndex((o) => o._id === id);
  if (index !== -1) {
    orders.value.splice(index, 1);
  }
}
</script>

<style scoped>
@keyframes fade {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade {
  animation: fade 0.3s ease-out;
}
</style>
