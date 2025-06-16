<template>
  <nav
    class="absolute left-64 flex w-full max-w-3xl mx-auto h-14 bg-white shadow-lg rounded-2xl mt-4 px-8 z-10"
  >
    <router-link
      to="/dashboard"
      class="font-bold text-xl text-[#1b93ac] tracking-wide absolute right-6 top-1/2 -translate-y-1/2"
    >
      لوحة التحكم
    </router-link>
    <!-- زر صورة الأدمن في أقصى يسار الحاوية -->
    <div
      class="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-4"
    >
      <div class="relative">
        <button
          @click.stop="showProfileMenu = !showProfileMenu"
          class="focus:outline-none"
        >
          <img
            :src="adminImage"
            alt="admin"
            class="w-11 h-11 rounded-full object-cover border-2 border-[#1b93ac] shadow-md hover:scale-105 transition"
          />
        </button>
        <transition name="fade">
          <div
            v-if="showProfileMenu"
            class="absolute left-auto right-48 top-full mt-2 bg-transparent flex items-start justify-end pointer-events-none w-full"
            ref="profileMenuWrapper"
            style="left: auto"
          >
            <div
              class="bg-white/95 border border-blue-100 min-w-[220px] p-5 rounded-2xl shadow-2xl flex flex-col items-center gap-2 animate-fade backdrop-blur-md pointer-events-auto"
              style="margin-right: 0"
            >
              <img
                :src="adminImage"
                alt="admin"
                class="w-14 h-14 rounded-full mb-2 border-2 border-[#1b93ac] shadow"
              />
              <span class="font-bold text-gray-800 mb-2 text-base">
                {{ authStore.user?.name || "أدمن" }}
              </span>
              <router-link to="/profile" class="w-full">
                <div
                  class="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-[#1b93ac] hover:bg-blue-50 hover:text-blue-700 transition font-medium text-right"
                >
                  <font-awesome-icon icon="user-circle" class="ml-2" /> الملف
                  الشخصي
                </div>
              </router-link>
              <button
                class="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 transition font-medium text-right"
                @click="logout"
              >
                <font-awesome-icon icon="sign-out-alt" class="ml-2" /> تسجيل
                الخروج
              </button>
            </div>
          </div>
        </transition>
      </div>
    </div>
    <!-- أيقونة الجرس مع عداد الإشعارات -->
    <div class="absolute left-24 top-1/2 -translate-y-1/2 flex items-center">
      <div class="relative">
        <button
          @click="toggleNotifications"
          ref="bellButtonRef"
          class="focus:outline-none"
        >
          <font-awesome-icon
            icon="bell"
            class="text-2xl text-[#1b93ac] hover:text-blue-700 transition"
          />
          <span
            v-if="notificationCount > 0"
            class="absolute -top-1 -left-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white animate-pulse"
          >
            {{ notificationCount > 9 ? "9+" : notificationCount }}
          </span>
        </button>
        <!-- بوب أب الإشعارات -->
        <transition name="fade">
          <div
            v-if="showNotifications"
            ref="notificationPopupRef"
            class="notification-popup absolute left-0 top-10 min-w-[260px] max-w-xs bg-white border border-blue-100 rounded-2xl shadow-2xl z-50 p-3 animate-fade"
          >
            <div
              v-if="notifications.length === 0"
              class="text-gray-400 text-center py-6"
            >
              لا توجد إشعارات جديدة
            </div>
            <ul v-else class="flex flex-col gap-2 max-h-72 overflow-y-auto">
              <li
                v-for="(notif, idx) in notifications"
                :key="idx"
                class="bg-blue-50/70 rounded-lg px-3 py-2 text-sm text-gray-800 flex items-center gap-2"
              >
                <font-awesome-icon icon="bell" class="text-blue-400" />
                <span>{{ notif.message }}</span>
                <span v-if="notif.time" class="ml-auto text-xs text-gray-400">{{
                  notif.time
                }}</span>
              </li>
            </ul>
          </div>
        </transition>
      </div>
    </div>
    <!-- نهاية أيقونة الجرس -->
  </nav>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useOrdersStore } from "@/stores/orders";
import { io } from "socket.io-client";
import {
  notifications,
  notificationCount,
  updateNotificationsFromOrders,
} from "@/utils/notifications";

const showProfileMenu = ref(false);
const showNotifications = ref(false);
const router = useRouter();
const adminImage = "/profile.jpg"; // يمكنك تغيير المسار لصورة الأدمن الحقيقية
const authStore = useAuthStore();
const ordersStore = useOrdersStore();

// WebSocket (Socket.io) setup
let socket;

// Refs for click outside detection
const profileMenuWrapper = ref(null);
const notificationPopupRef = ref(null);
const bellButtonRef = ref(null);

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  // الاتصال بسيرفر الويب سوكت
  socket = io("http://localhost:5000", { withCredentials: true });

  socket.on("admin_notification", (data) => {
    // Log received data for debugging
    console.log("WebSocket admin_notification received:", data);

    const orderId = data.orderId;
    const isNew = !notifications.value.some((n) => n.id === orderId);

    if (isNew) {
      // Optimistically add to the top of the list for immediate feedback
      notifications.value.unshift({
        id: orderId,
        message: `طلب جديد من ${data.name || "مستخدم"} (${
          data.phone || "بدون رقم"
        }) بحاجة للمراجعة.`,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
      // Temporarily update count based on this optimistic add.
      // updateNotificationsFromOrders will provide the final count.
      notificationCount.value = notifications.value.length;
      console.log(
        `Optimistically added notification for order ${orderId}. Count is now ${notificationCount.value}`
      );
    }

    // Always fetch all orders to ensure consistency and correct status,
    // and to rebuild the notifications list accurately.
    ordersStore
      .fetchAllOrders()
      .then(() => {
        console.log(
          "Orders fetched successfully after WebSocket notification. Store orders:",
          JSON.parse(JSON.stringify(ordersStore.orders))
        );
        // updateNotificationsFromOrders will rebuild notifications.value and update notificationCount.value
        // based on the authoritative data from the store.
        updateNotificationsFromOrders(ordersStore.orders);
        console.log(
          `Notifications updated from store. Final count is ${notificationCount.value}`
        );
      })
      .catch((error) => {
        console.error(
          "Error fetching orders after WebSocket notification:",
          error
        );
        // Attempt to update from current store even if fetch failed,
        // this will ensure the list is consistent with the (potentially stale) store.
        updateNotificationsFromOrders(ordersStore.orders);
      });
  });

  // Initial fetch of orders and update of notifications on component mount
  ordersStore
    .fetchAllOrders()
    .then(() => {
      console.log(
        "Initial orders fetched on mount. Store orders:",
        JSON.parse(JSON.stringify(ordersStore.orders))
      );
      updateNotificationsFromOrders(ordersStore.orders);
    })
    .catch((error) => {
      console.error("Error fetching initial orders on mount:", error);
    });
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
  if (socket) socket.disconnect();
});

function toggleNotifications() {
  showNotifications.value = !showNotifications.value;
  if (showNotifications.value) {
    ordersStore.fetchAllOrders().then(() => {
      updateNotificationsFromOrders(ordersStore.orders);
    });
  }
}

// إغلاق البوب أب عند الضغط خارج القائمة
// const profileMenuWrapper = ref(null); // Moved up

function handleClickOutside(event) {
  // إغلاق قائمة البروفايل
  if (
    profileMenuWrapper.value &&
    !profileMenuWrapper.value.contains(event.target) &&
    showProfileMenu.value // Only try to close if it's open
  ) {
    // Check if the click was on the profile button itself
    const profileButton = profileMenuWrapper.value.previousElementSibling; // Assuming button is direct sibling
    if (profileButton && profileButton.contains(event.target)) {
      return; // Click was on the profile button, let its own handler manage it
    }
    showProfileMenu.value = false;
  }

  // إغلاق بوب أب الإشعارات
  if (
    notificationPopupRef.value &&
    !notificationPopupRef.value.contains(event.target) &&
    bellButtonRef.value &&
    !bellButtonRef.value.contains(event.target) &&
    showNotifications.value // Only try to close if it's open
  ) {
    showNotifications.value = false;
  }
}

async function logout() {
  await authStore.logout();
  await authStore.checkAuth();
  showProfileMenu.value = false;
  router.push("/login");
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade {
  animation: fadeIn 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
