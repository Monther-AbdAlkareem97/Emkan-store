<template>
  <section
    class="min-h-[70vh] w-11/12 m-auto flex flex-col items-center justify-center py-16 animate-fadeIn"
  >
    <h2 class="text-2xl md:text-3xl font-extrabold text-blue-700 mb-6">
      الإعدادات
    </h2>
    <div
      class="w-full max-w-2xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 flex flex-col gap-6"
    >
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-1">
          <label class="text-gray-700 font-semibold text-right pr-1"
            >تغيير رقم الجوال</label
          >
          <input
            type="tel"
            v-model="settings.phone"
            class="w-full px-4 py-3 border-2 border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none transition text-right bg-gray-50"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-gray-700 font-semibold text-right pr-1">
            تغيير العنوان
          </label>
          <input
            type="text"
            v-model="settings.address"
            class="w-full px-4 py-3 border-2 border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none transition text-right bg-gray-50"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-gray-700 font-semibold text-right pr-1"
            >تفعيل الإشعارات</label
          >
          <input
            type="checkbox"
            v-model="settings.notifications"
            class="w-5 h-5 text-blue-600 rounded focus:ring-blue-400"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-gray-700 font-semibold text-right pr-1">
            تغيير كلمة المرور
          </label>
          <input
            type="password"
            v-model="settings.password"
            class="w-full px-4 py-3 border-2 border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none transition text-right bg-gray-50"
            placeholder="********"
          />
        </div>
      </div>
      <button
        class="bg-gradient-to-l from-[#AFDBB0] to-[#0074AF] text-white font-bold px-8 py-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-400 mt-4"
        @click="saveSettings"
      >
        حفظ التغييرات
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useUsersStore } from "@/stores/users";

const authStore = useAuthStore();
const usersStore = useUsersStore();

const currentUser = computed(() => authStore.user);

const settings = ref({
  phone: currentUser.value?.phone || "",
  address: currentUser.value?.address || "",
  password: "",
  notifications: true,
});

// مزامنة البيانات عند تغيير المستخدم الحالي
watch(currentUser, (val) => {
  if (val) {
    settings.value.phone = val.phone || "";
    settings.value.address = val.address || "";
  }
});

function saveSettings() {
  if (currentUser.value) {
    const updateData = {
      ...currentUser.value,
      phone: settings.value.phone,
      address: settings.value.address,
    };
    if (settings.value.password) {
      updateData.password = settings.value.password;
    }
    usersStore.updateUser(currentUser.value.id, updateData);
    alert("تم حفظ التغييرات بنجاح");
    settings.value.password = ""; // إعادة تعيين الحقل بعد الحفظ
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
