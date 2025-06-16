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
          <font-awesome-icon icon="user-plus" class="text-white text-3xl" />
        </div>
        <h2 class="text-2xl md:text-3xl font-extrabold text-blue-700">
          إنشاء حساب جديد
        </h2>
      </div>
      <form @submit.prevent="signup" class="flex flex-col gap-4">
        <div class="flex flex-col gap-1">
          <label class="mb-1 text-gray-700 font-semibold text-right pr-1"
            >الاسم الكامل</label
          >
          <input
            type="text"
            v-model="name"
            required
            class="w-full px-4 py-3 border-2 border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none transition text-right"
            placeholder="اسمك الكامل"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="mb-1 text-gray-700 font-semibold text-right pr-1"
            >رقم الجوال</label
          >
          <div class="flex gap-2">
            <input
              type="text"
              v-model="phoneNumber"
              required
              pattern="[0-9]{7}"
              maxlength="7"
              minlength="7"
              class="w-full px-4 py-3 border-2 border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none transition text-right"
              placeholder="أدخل 7 أرقام"
            />
            <select
              v-model="phonePrefix"
              required
              class="px-3 py-3 border-2 border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none transition text-right bg-white"
            >
              <option value="091">091</option>
              <option value="093">093</option>
              <option value="092">092</option>
              <option value="094">094</option>
            </select>
          </div>
        </div>
        <div class="flex flex-col gap-1">
          <label class="mb-1 text-gray-700 font-semibold text-right pr-1">
            العنوان
          </label>
          <input
            type="text"
            v-model="address"
            required
            class="w-full px-4 py-3 border-2 border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none transition text-right"
            placeholder="العنوان الكامل"
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
          class="mt-4 bg-gradient-to-l from-blue-600 to-green-500 text-white text-lg font-bold px-8 py-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          إنشاء حساب
        </button>
      </form>
      <div class="text-center mt-2 flex flex-col gap-2">
        <router-link
          to="/login"
          class="text-sm text-gray-500 hover:text-blue-600 underline transition"
        >
          لدي حساب بالفعل
        </router-link>
        <router-link
          to="/"
          class="text-blue-600 hover:text-green-500 font-semibold transition"
        >
          العودة للصفحة الرئيسية
        </router-link>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";

const name = ref("");
const phonePrefix = ref("091");
const phoneNumber = ref("");
const password = ref("");
const address = ref("");
const showPassword = ref(false);
const authStore = useAuthStore();
const router = useRouter();

async function signup() {
  const phone = phonePrefix.value + phoneNumber.value;
  await authStore.signup({
    name: name.value,
    phone: phone,
    password: password.value,
    address: address.value,
    photo: "/profile.jpg",
  });
  if (!authStore.error) {
    // Redirect to login page after successful signup
    router.push("/login");
  } else {
    alert("حدث خطأ أثناء إنشاء الحساب: " + authStore.error);
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
