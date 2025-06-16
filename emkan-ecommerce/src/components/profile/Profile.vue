<template>
  <section
    v-if="currentUserProfile"
    class="min-h-[70vh] w-11/12 m-auto flex flex-col items-center justify-center py-16 animate-fadeIn"
  >
    <h2 class="text-2xl md:text-3xl font-extrabold text-blue-700 mb-6">
      الملف الشخصي
    </h2>
    <div
      class="w-full max-w-2xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 flex flex-col gap-6"
    >
      <!-- بيانات الزبون هنا -->
      <div class="flex flex-col gap-2">
        <div class="flex items-center gap-4">
          <img
            :src="currentUserProfile.photo || '/profile.jpg'"
            alt="صورة الزبون"
            class="w-20 h-20 rounded-full border-2 border-blue-200"
          />
          <div>
            <div class="font-bold text-lg text-blue-800">
              {{ currentUserProfile.name || "اسم الزبون" }}
            </div>
            <div class="text-gray-500">
              {{ currentUserProfile.email || currentUserProfile.phone || "" }}
            </div>
          </div>
        </div>
        <div class="mt-4">
          <div class="text-gray-700 font-semibold">
            العنوان:
            <span class="font-normal">{{
              currentUserProfile.address || ""
            }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
  <section v-else class="min-h-[70vh] flex items-center justify-center">
    <div class="text-xl text-red-600 font-bold">
      يجب تسجيل الدخول لعرض الملف الشخصي
    </div>
  </section>
</template>

<script setup>
import { onMounted, computed } from "vue";
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();

onMounted(async () => {
  await authStore.checkAuth();
});

const currentUserProfile = computed(() => {
  if (!authStore.user || !authStore.isLoggedIn) return null;
  return authStore.user;
});
</script>

<style scoped></style>
