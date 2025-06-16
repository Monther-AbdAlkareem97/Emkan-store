<template>
  <nav
    class="w-full h-20 bg-white flex justify-between items-center px-6 shadow-md sticky top-0 z-50"
    dir="rtl"
  >
    <!-- الشعار -->
    <div class="flex items-center gap-3">
      <span
        class="bg-red-900 text-3xl font-extrabold text-gray-800 tracking-tight select-none"
      >
        <img
          src="/profile-1.jpg"
          alt="شعار المتجر"
          class="h-20 w-auto md:w-60 bg-contain select-none"
        />
      </span>
    </div>

    <!-- عناصر التحكم -->
    <div class="flex items-center gap-2 md:gap-4 relative">
      <!-- زر السلة -->
      <button
        @click="goToCart"
        class="flex items-center justify-center bg-gradient-to-l from-[#AFDBB0] to-[#0074AF] text-white shadow-lg rounded-full w-12 h-12 text-2xl transition-all duration-300 hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-400 relative"
        aria-label="السلة"
      >
        <font-awesome-icon :icon="['fas', 'shopping-cart']" />
        <span
          v-if="cartStore.cart.length > 0"
          class="absolute -top-1 -left-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-white animate-bounce"
        >
          {{ cartStore.cart.reduce((sum, item) => sum + item.quantity, 0) }}
        </span>
      </button>

      <!-- بوب أب خيارات المستخدم (يظهر عند تسجيل الدخول، سيتم تفعيله لاحقاً مع الباك اند) -->
      <div class="relative" ref="popupContainer" :key="isUserLoggedIn">
        <button
          @click="togglePopup"
          class="flex items-center justify-center border-2 border-blue-100 text-blue-700 shadow rounded-full w-12 h-12 text-2xl transition-all duration-300 hover:bg-blue-50 hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400 overflow-hidden"
          :style="
            isUserLoggedIn && authStore.user && authStore.user.photo
              ? `background-image: url('${authStore.user.photo}'); background-size: cover; background-position: center;`
              : 'background-color: #fff;'
          "
          aria-label="حساب المستخدم"
        >
          <font-awesome-icon
            v-if="!isUserLoggedIn || !authStore.user || !authStore.user.photo"
            :icon="['fas', 'user']"
          />
        </button>
        <div
          v-if="showPopup && isUserLoggedIn"
          class="absolute top-16 left-0 w-60 bg-white/90 border border-blue-100 rounded-2xl shadow-2xl p-3 z-50 animate-fade min-w-[200px] backdrop-blur-md transition-all duration-300"
          style="
            box-shadow: 0 8px 32px 0 rgba(34, 197, 94, 0.1),
              0 1.5px 8px 0 rgba(37, 99, 235, 0.08);
          "
        >
          <button
            v-if="authStore.user && authStore.user.role === 'admin'"
            class="w-full flex items-center gap-3 text-right text-blue-600 hover:text-white font-bold py-3 px-4 rounded-xl transition bg-blue-50 hover:bg-gradient-to-l hover:from-[#AFDBB0] hover:to-[#0074AF] mb-1"
            @click="goToDashboard"
          >
            <font-awesome-icon
              :icon="['fas', 'tachometer-alt']"
              class="text-xl"
            />
            الرجوع للوحة التحكم
          </button>
          <button
            class="w-full flex items-center gap-3 text-right text-AFDBB0[#0074AF] hover:text-[#] font-bold py-3 px-4 rounded-xl transition bg-white/60 hover:bg-[#AFDBB0]/40 mb-1"
            @click="goToProfile"
          >
            <font-awesome-icon :icon="['fas', 'user-circle']" class="text-xl" />
            حسابي
          </button>
          <button
            class="w-full flex items-center gap-3 text-right text-red-500 hover:text-white font-bold py-3 px-4 rounded-xl transition bg-red-50 hover:bg-gradient-to-l hover:from-[#0074AF] hover:to-[#AFDBB0]"
            @click="logout"
          >
            <font-awesome-icon
              :icon="['fas', 'sign-out-alt']"
              class="text-xl"
            />
            تسجيل خروج
          </button>
        </div>
        <!-- بوب أب تسجيل الدخول (يظهر للزائر فقط) -->
        <div
          v-if="showPopup && !isUserLoggedIn"
          class="absolute top-16 left-0 w-60 bg-white/90 border border-blue-100 rounded-2xl shadow-2xl p-4 z-50 animate-fade min-w-[200px] backdrop-blur-md transition-all duration-300 flex flex-col items-center"
          style="
            box-shadow: 0 8px 32px 0 rgba(34, 197, 94, 0.1),
              0 1.5px 8px 0 rgba(37, 99, 235, 0.08);
          "
        >
          <font-awesome-icon
            :icon="['fas', 'user']"
            class="text-blue-600 text-3xl mb-2"
          />
          <span class="font-bold text-blue-700 mb-2">مرحباً بك!</span>
          <button
            class="w-full text-center text-white font-bold py-3 px-4 rounded-xl bg-gradient-to-l from-[#AFDBB0] to-[#0074AF] shadow-lg transition hover:scale-105 hover:shadow-xl mb-2"
            @click="login"
          >
            تسجيل الدخول
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useCartStore } from "@/stores/cart";
import { useAuthStore } from "@/stores/auth";
import { storeToRefs } from "pinia";

const showPopup = ref(false);
const popupContainer = ref(null);
const router = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();

// استخدم storeToRefs للحصول على reactive refs مباشرة
const { isLoggedIn, user } = storeToRefs(authStore);

const isUserLoggedIn = computed(() => isLoggedIn.value && user.value);

const togglePopup = () => {
  showPopup.value = !showPopup.value;
};

const login = () => {
  showPopup.value = false;
  router.push("/login");
};

// دالة الضغط على السلة
const goToCart = () => {
  if (isUserLoggedIn.value) {
    router.push("/cart");
  } else {
    router.push("/login");
  }
};

// دالة للكشف عن الضغط خارج البوب أب
const handleClickOutside = (event) => {
  if (popupContainer.value && !popupContainer.value.contains(event.target)) {
    showPopup.value = false;
  }
};

const goToProfile = () => {
  router.push("/profile");
  showPopup.value = false;
};

const goToOrders = () => {
  router.push("/orders");
  showPopup.value = false;
};

const goToDashboard = () => {
  router.push("/dashboard");
  showPopup.value = false;
};

const logout = async () => {
  await authStore.logout();
  await authStore.checkAuth(); // تحقق من حالة المستخدم بعد تسجيل الخروج
  showPopup.value = false;
  router.push("/login");
  window.location.reload(); // يجبر إعادة تحميل الصفحة وتحديث كل شيء
};

watch(
  () => authStore.isLoggedIn,
  () => {
    showPopup.value = false;
  }
);
watch(
  () => authStore.user,
  () => {
    showPopup.value = false;
  }
);

onMounted(async () => {
  cartStore.fetchCart();
  document.addEventListener("click", handleClickOutside);
  await authStore.checkAuth(); // تحقق من حالة المستخدم عند تحميل الصفحة
  console.log("بيانات المستخدم:", user.value); // طباعة بيانات المستخدم في الكونسول
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
.gradient-bg {
  background: linear-gradient(to right, #1b93ac, #7ae792);
}
.animate-fade {
  animation: fade 0.3s ease-out;
}
@keyframes fade {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
