<template>
  <div
    class="p-4 pt-32 w-full md:w-4/5 min-h-screen absolute left-0 custom-dashboard-bg"
  >
    <h1
      data-aos="fade-right"
      class="text-3xl font-extrabold mb-8 text-gray-800 flex items-center gap-2"
    >
      <FontAwesomeIcon
        :icon="['fas', 'shopping-basket']"
        class="w-8 h-8 text-blue-500"
      />
      طلبات الشراء
    </h1>

    <!-- Loading State -->
    <div v-if="ordersStore.loading" class="text-center py-10">
      <p class="text-xl text-gray-600">جاري تحميل الطلبات...</p>
    </div>

    <!-- Error State -->
    <div
      v-else-if="ordersStore.error"
      class="text-center py-10 bg-red-50 p-6 rounded-lg shadow-md"
    >
      <p class="text-xl text-red-600 font-semibold">
        حدث خطأ أثناء تحميل الطلبات:
      </p>
      <p class="text-md text-red-500 mt-2">{{ ordersStore.error }}</p>
      <button
        @click="retryFetchOrders"
        class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
      >
        إعادة المحاولة
      </button>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!ordersStore.orders || ordersStore.orders.length === 0"
      class="text-center py-10"
    >
      <p class="text-xl text-gray-500">لا توجد طلبات لعرضها حاليًا.</p>
    </div>

    <!-- Data Table -->
    <div v-else class="overflow-x-auto">
      <table
        class="min-w-full bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden"
      >
        <thead>
          <tr
            class="bg-gradient-to-r from-blue-100 to-blue-200 text-gray-700 uppercase text-sm leading-normal"
          >
            <th class="py-4 px-6 text-right font-bold">رقم الطلب</th>
            <th class="py-4 px-6 text-right font-bold">اسم العميل</th>
            <th class="py-4 px-6 text-right font-bold">تاريخ الطلب</th>
            <th class="py-4 px-6 text-right font-bold">حالة الطلب</th>
            <th class="py-4 px-6 text-right font-bold">الإجراءات</th>
          </tr>
        </thead>
        <tbody class="text-gray-700 text-base font-medium">
          <tr
            v-for="(order, idx) in ordersStore.orders"
            :key="order._id"
            class="border-b border-gray-100 hover:bg-blue-50 transition-all duration-200 group"
          >
            <td class="py-4 px-6 text-right">{{ idx + 1 }}#</td>
            <td class="py-4 px-6 text-right">
              {{ order.user?.name || "---" }}
            </td>
            <td class="py-4 px-6 text-right">
              {{
                new Date(order.createdAt).toLocaleDateString("ar-EG", {
                  weekday: "long",
                  year: "numeric",
                  month: "numeric",
                  day: "numeric",
                }) +
                " في الساعة " +
                new Date(order.createdAt).toLocaleTimeString("ar-EG", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })
              }}
            </td>
            <td class="py-4 px-6 text-right">
              <span
                :class="[
                  'inline-block px-3 py-1 rounded-full font-semibold text-xs shadow-sm',
                  order.status === 'awaiting_review'
                    ? 'bg-yellow-100 text-yellow-700'
                    : order.status === 'payment_confirmed'
                    ? 'bg-green-100 text-green-700'
                    : order.status === 'completed'
                    ? 'bg-green-100 text-green-700'
                    : order.status === 'cancelled_by_user' ||
                      order.status === 'cancelled_by_admin'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-700',
                ]"
              >
                {{
                  order.status === "awaiting_review"
                    ? "قيد المراجعة"
                    : order.status === "payment_confirmed"
                    ? "تم التأكيد"
                    : order.status === "completed"
                    ? "تم التأكيد"
                    : order.status === "cancelled_by_user"
                    ? "ملغي من العميل"
                    : order.status === "cancelled_by_admin"
                    ? "ملغي من الأدمن"
                    : order.status
                }}
              </span>
            </td>
            <td class="py-4 px-6 text-right">
              <button
                class="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-150"
                @click="openOrderModal(order)"
              >
                <FontAwesomeIcon :icon="['fas', 'eye']" class="w-5 h-5" />
                عرض التفاصيل
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Order Details Modal -->
    <transition name="fade">
      <div
        v-if="showOrderModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      >
        <div
          class="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative animate-fade"
        >
          <button
            @click="closeOrderModal"
            class="absolute left-4 top-4 text-gray-400 hover:text-red-500 text-2xl font-bold"
          >
            &times;
          </button>
          <h2 class="text-2xl font-bold mb-4 text-blue-700">تفاصيل الطلب</h2>
          <div class="mb-2">
            <span class="font-semibold">اسم العميل:</span>
            {{ selectedOrder?.user?.name || "---" }}
          </div>
          <div class="mb-2">
            <span class="font-semibold">رقم الجوال:</span>
            {{ selectedOrder?.user?.phone || "---" }}
          </div>
          <div class="mb-2">
            <span class="font-semibold">تاريخ الطلب:</span>
            {{
              selectedOrder?.createdAt
                ? new Date(selectedOrder.createdAt).toLocaleDateString(
                    "ar-EG",
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "numeric",
                      day: "numeric",
                    }
                  ) +
                  " في الساعة " +
                  new Date(selectedOrder.createdAt).toLocaleTimeString(
                    "ar-EG",
                    { hour: "2-digit", minute: "2-digit", hour12: true }
                  )
                : "---"
            }}
          </div>
          <div class="mb-2">
            <span class="font-semibold">الحالة:</span>
            <span
              :class="[
                'inline-block px-3 py-1 rounded-full font-semibold text-xs shadow-sm',
                selectedOrder?.status === 'awaiting_review'
                  ? 'bg-yellow-100 text-yellow-700'
                  : selectedOrder?.status === 'payment_confirmed'
                  ? 'bg-green-100 text-green-700'
                  : selectedOrder?.status === 'completed'
                  ? 'bg-green-100 text-green-700'
                  : selectedOrder?.status === 'cancelled_by_user' ||
                    selectedOrder?.status === 'cancelled_by_admin'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-700',
              ]"
            >
              {{
                selectedOrder?.status === "awaiting_review"
                  ? "قيد المراجعة"
                  : selectedOrder?.status === "payment_confirmed"
                  ? "تم التأكيد"
                  : selectedOrder?.status === "completed"
                  ? "تم التأكيد"
                  : selectedOrder?.status === "cancelled_by_user"
                  ? "ملغي من العميل"
                  : selectedOrder?.status === "cancelled_by_admin"
                  ? "ملغي من الأدمن"
                  : selectedOrder?.status
              }}
            </span>
          </div>
          <div class="mb-2">
            <span class="font-semibold">الإجمالي:</span>
            {{ (selectedOrder?.totalAmount ?? 0).toLocaleString() }} دينار
          </div>
          <div class="mb-2">
            <span class="font-semibold">عدد المنتجات:</span>
            {{ selectedOrder?.items?.length || 0 }} منتج
          </div>
          <div class="mb-4">
            <span class="font-semibold">المنتجات:</span>
            <ul class="list-disc pr-6 mt-2">
              <li v-for="item in selectedOrder?.items" :key="item._id">
                {{ item.product?.name || item.name }}
                <span
                  v-if="
                    item.product?.offer?.active &&
                    item.product?.offer?.discountValue > 0
                  "
                  class="text-xs text-red-500 font-bold ml-2"
                >
                  (مخفض)
                </span>
                - الكمية: {{ item.quantity }}
              </li>
            </ul>
          </div>
          <div class="flex gap-4 mt-6">
            <button
              v-if="selectedOrder?.status === 'awaiting_review'"
              @click="confirmOrder"
              class="flex-1 py-2 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 transition"
            >
              تأكيد الطلب
            </button>
            <button
              v-if="selectedOrder?.status === 'awaiting_review'"
              @click="cancelOrder"
              class="flex-1 py-2 rounded-lg bg-red-500 text-white font-bold hover:bg-red-600 transition"
            >
              إلغاء الطلب
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faShoppingBasket, faEye } from "@fortawesome/free-solid-svg-icons";
library.add(faShoppingBasket, faEye);
import { onMounted, watch, ref, inject } from "vue";
import { useOrdersStore } from "@/stores/orders";
import axios from "axios";
import { updateNotificationsFromOrders } from "@/utils/notifications";

const ordersStore = useOrdersStore();

const showOrderModal = ref(false);
const selectedOrder = ref(null);
const openOrderModal = (order) => {
  selectedOrder.value = order;
  showOrderModal.value = true;
};
const closeOrderModal = () => {
  showOrderModal.value = false;
  selectedOrder.value = null;
};

const confirmOrder = async () => {
  if (!selectedOrder.value) return;
  try {
    await axios.post(
      "http://localhost:5000/api/orders/approve",
      { orderId: selectedOrder.value._id },
      { withCredentials: true }
    );
    await ordersStore.fetchAllOrders();
    updateNotificationsFromOrders(ordersStore.orders);
    closeOrderModal();
  } catch (err) {
    alert(
      "حدث خطأ أثناء تأكيد الطلب: " +
        (err.response?.data?.message || err.message)
    );
  }
};

const cancelOrder = async () => {
  if (!selectedOrder.value) return;
  try {
    await axios.post(
      "http://localhost:5000/api/orders/cancel",
      {
        orderId: selectedOrder.value._id,
        byAdmin: true, // --- إضافة هذا الحقل ---
      },
      { withCredentials: true }
    );
    await ordersStore.fetchAllOrders();
    closeOrderModal();
  } catch (err) {
    alert(
      "حدث خطأ أثناء إلغاء الطلب: " +
        (err.response?.data?.message || err.message)
    );
  }
};
</script>

<style scoped>
.custom-dashboard-bg {
  background: linear-gradient(to right, #0074af, #afdbb0);
}

/* تحسينات إضافية لعصرية الصفحة */
::-webkit-scrollbar {
  height: 8px;
  background: #f1f1f1;
  border-radius: 8px;
}
::-webkit-scrollbar-thumb {
  background: #b3c6e0;
  border-radius: 8px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active in <2.1.8 */ {
  opacity: 0;
}
</style>
