<template>
  <section
    class="min-h-[70vh] flex items-center justify-center py-16 animate-fadeIn"
  >
    <div
      class="w-full max-w-md bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl p-8 flex flex-col gap-6"
    >
      <div class="flex flex-col items-center gap-2 mb-4">
        <div
          class="bg-gradient-to-l from-blue-600 to-green-500 rounded-full p-4 shadow-lg mb-2"
        >
          <font-awesome-icon icon="user" class="text-white text-3xl" />
        </div>
        <h2 class="text-2xl md:text-3xl font-extrabold text-blue-700">
          تسجيل الدخول
        </h2>
      </div>
      <form @submit.prevent="login" class="flex flex-col gap-4">
        <div>
          <label class="block mb-1 text-gray-700 font-semibold"
            >رقم الجوال</label
          >
          <input
            type="tel"
            v-model="phone"
            required
            pattern="[0-9]{10,15}"
            class="w-full px-4 py-3 border-2 border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none transition"
            placeholder="091xxxxxxxx"
          />
        </div>
        <div class="relative flex flex-col gap-1">
          <label class="mb-1 text-gray-700 font-semibold text-right pr-1"
            >كلمة المرور</label
          >
          <input
            :type="showPassword ? 'text' : 'password'"
            v-model="password"
            required
            class="w-full px-4 py-3 border-2 border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none transition pr-12 text-right"
            placeholder="********"
          />
          <button
            type="button"
            class="absolute left-3 top-10 text-xl text-gray-400 hover:text-blue-600 focus:outline-none"
            @click="showPassword = !showPassword"
            tabindex="-1"
            aria-label="إظهار/إخفاء كلمة المرور"
          >
            <font-awesome-icon
              :icon="showPassword ? ['fas', 'eye-slash'] : ['fas', 'eye']"
            />
          </button>
        </div>
        <button
          type="submit"
          class="mt-2 bg-gradient-to-l from-blue-600 to-green-500 text-white text-lg font-bold px-8 py-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          دخول
        </button>
      </form>
      <div
        v-if="showError"
        class="fixed inset-0 flex items-center justify-center z-50"
      >
        <div
          class="bg-white border-2 border-red-400 rounded-xl shadow-xl p-6 flex flex-col items-center animate-fadeIn"
        >
          <font-awesome-icon
            :icon="['fas', 'exclamation-triangle']"
            class="text-red-500 text-3xl mb-2"
          />
          <span class="text-red-600 font-bold mb-2"
            >بيانات الدخول غير صحيحة</span
          >
          <button
            @click="showError = false"
            class="mt-2 px-6 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition"
          >
            إغلاق
          </button>
        </div>
      </div>
      <div class="text-center mt-2 flex flex-col gap-2">
        <router-link
          to="/"
          class="text-blue-600 hover:text-green-500 font-semibold transition"
        >
          العودة للصفحة الرئيسية
        </router-link>
        <router-link
          to="/signup"
          class="text-sm text-gray-500 hover:text-blue-600 underline transition"
        >
          أنا زبون جديد
        </router-link>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";

const phone = ref("");
const password = ref("");
const showPassword = ref(false);
const authStore = useAuthStore();
const router = useRouter();
const showError = ref(false);

async function login() {
  await authStore.login(phone.value, password.value);
  if (authStore.isLoggedIn) {
    await authStore.checkAuth(); // تحديث بيانات المستخدم بعد تسجيل الدخول
    if (authStore.user && authStore.user.role === "admin") {
      router.push("/dashboard");
    } else {
      router.push("/");
    }
  } else {
    showError.value = true;
  }
}
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
