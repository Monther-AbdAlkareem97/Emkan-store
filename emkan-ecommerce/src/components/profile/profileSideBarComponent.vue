<template>
  <div>
    <!-- زر البرغر يظهر فقط على الهاتف -->
    <button
      class="md:hidden fixed top-4 right-4 z-40 bg-white shadow-lg rounded-full p-3 border border-blue-100 text-blue-700 hover:bg-blue-50 transition"
      @click="showSidebar = true"
    >
      <font-awesome-icon icon="bars" />
    </button>
    <!-- أوفرلاي و سايد بار overlay للموبايل -->
    <transition name="sidebar-slide">
      <div v-if="showSidebar">
        <div
          class="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          @click="showSidebar = false"
        ></div>
        <aside
          class="fixed flex flex-col h-screen w-4/5 max-w-xs bg-white text-black p-4 rounded-l-3xl shadow-2xl z-50 top-0 right-0"
          style="min-width: 180px; max-width: 320px"
        >
          <div class="mb-8">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-bold text-blue-700 text-center">
                الملف الشخصي
              </h2>
              <button
                @click="showSidebar = false"
                class="text-gray-400 hover:text-red-500 text-2xl transition-all duration-200 bg-gray-100 rounded-full p-2 shadow-md"
              >
                <font-awesome-icon icon="xmark" />
              </button>
            </div>
            <router-link
              to="/"
              class="block w-full mb-4"
              @click="showSidebar = false"
            >
              <div
                class="py-2 px-4 rounded-xl text-base font-semibold transition cursor-pointer shadow-sm border flex items-center gap-2 bg-white hover:bg-blue-100 text-blue-700"
              >
                <font-awesome-icon icon="store" />
                <span>الرجوع للمتجر</span>
              </div>
            </router-link>
          </div>
          <div
            class="flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-1"
            style="max-height: 80vh; font-size: 1rem"
          >
            <router-link
              to="/profile"
              class="w-full"
              @click="showSidebar = false"
            >
              <div
                :class="[
                  'py-3 px-4 min-w-[120px] rounded-xl text-base font-semibold transition cursor-pointer shadow-sm border flex items-center gap-2',
                  $route.path === '/profile'
                    ? 'bg-gradient-to-l from-[#0074AF] to-[#AFDBB0] text-white font-bold border-blue-200'
                    : 'text-gray-700 hover:bg-gradient-to-l hover:from-[#0074AF] hover:to-[#AFDBB0] hover:text-white border-blue-50',
                ]"
              >
                <font-awesome-icon icon="user-circle" />
                <span>الملف الشخصي</span>
              </div>
            </router-link>
            <router-link
              to="/profile/orders"
              class="w-full"
              @click="showSidebar = false"
            >
              <div
                :class="[
                  'py-3 px-4 min-w-[120px] rounded-xl text-base font-semibold transition cursor-pointer shadow-sm border flex items-center gap-2',
                  $route.path === '/profile/orders'
                    ? 'bg-gradient-to-l from-[#0074AF] to-[#AFDBB0] text-white font-bold border-blue-200'
                    : 'text-gray-700 hover:bg-gradient-to-l hover:from-[#0074AF] hover:to-[#AFDBB0] hover:text-white border-blue-50',
                ]"
              >
                <font-awesome-icon icon="box" />
                <span>طلباتي</span>
              </div>
            </router-link>
            <router-link
              to="/profile/settings"
              class="w-full"
              @click="showSidebar = false"
            >
              <div
                :class="[
                  'py-3 px-4 min-w-[120px] rounded-xl text-base font-semibold transition cursor-pointer shadow-sm border flex items-center gap-2',
                  $route.path === '/profile/settings'
                    ? 'bg-gradient-to-l from-[#0074AF] to-[#AFDBB0] text-white font-bold border-blue-200'
                    : 'text-gray-700 hover:bg-gradient-to-l hover:from-[#0074AF] hover:to-[#AFDBB0] hover:text-white border-blue-50',
                ]"
              >
                <font-awesome-icon icon="cog" />
                <span>الإعدادات</span>
              </div>
            </router-link>
          </div>
        </aside>
      </div>
    </transition>
    <!-- سايد بار الديسكتوب -->
    <aside
      class="hidden md:flex flex-col fixed h-screen w-1/5 bg-white text-black p-4 rounded-l-3xl shadow-2xl z-30"
      style="min-width: 180px; max-width: 320px"
    >
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-blue-700 mb-6 text-center">
          الملف الشخصي
        </h2>
        <router-link to="/" class="block w-full mb-4">
          <div
            class="py-2 px-4 rounded-xl text-base font-semibold transition cursor-pointer shadow-sm border flex items-center gap-2 bg-white hover:bg-blue-100 text-blue-700"
          >
            <font-awesome-icon icon="store" />
            <span>الرجوع للمتجر</span>
          </div>
        </router-link>
      </div>
      <div
        class="flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-1"
        style="max-height: 80vh; font-size: 1rem"
      >
        <router-link to="/profile" class="w-full">
          <div
            :class="[
              'py-3 px-4 min-w-[120px] rounded-xl text-base font-semibold transition cursor-pointer shadow-sm border flex items-center gap-2',
              $route.path === '/profile'
                ? 'bg-gradient-to-l from-[#AFDBB0] to-[#0074AF] text-white font-bold border-blue-200'
                : 'text-gray-700 hover:bg-gradient-to-l hover:from-[#AFDBB0] hover:to-[#0074AF] hover:text-white border-blue-50',
            ]"
          >
            <font-awesome-icon icon="user-circle" />
            <span>الملف الشخصي</span>
          </div>
        </router-link>
        <router-link to="/profile/orders" class="w-full">
          <div
            :class="[
              'py-3 px-4 min-w-[120px] rounded-xl text-base font-semibold transition cursor-pointer shadow-sm border flex items-center gap-2',
              $route.path === '/profile/orders'
                ? 'bg-gradient-to-l from-[#AFDBB0] to-[#0074AF] text-white font-bold border-blue-200'
                : 'text-gray-700 hover:bg-gradient-to-l hover:from-[#AFDBB0] hover:to-[#0074AF] hover:text-white border-blue-50',
            ]"
          >
            <font-awesome-icon icon="box" />
            <span>طلباتي</span>
          </div>
        </router-link>
        <router-link to="/profile/settings" class="w-full">
          <div
            :class="[
              'py-3 px-4 min-w-[120px] rounded-xl text-base font-semibold transition cursor-pointer shadow-sm border flex items-center gap-2',
              $route.path === '/profile/settings'
                ? 'bg-gradient-to-l from-[#AFDBB0] to-[#0074AF] text-white font-bold border-blue-200'
                : 'text-gray-700 hover:bg-gradient-to-l hover:from-[#AFDBB0] hover:to-[#0074AF] hover:text-white border-blue-50',
            ]"
          >
            <font-awesome-icon icon="cog" />
            <span>الإعدادات</span>
          </div>
        </router-link>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRoute } from "vue-router";
const showSidebar = ref(false);
const $route = useRoute();
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  background: #f1f1f1;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #b3e0d6;
  border-radius: 8px;
}
</style>
