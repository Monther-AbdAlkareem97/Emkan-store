<template>
  <div class="w-full h-full">
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
        >
          <div class="mb-8">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-bold text-blue-700 text-center">
                لوحة التحكم
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
            class="flex-1 flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-1"
            style="font-size: 1rem"
          >
            <router-link
              to="/dashboard/orders"
              class="w-full"
              @click="showSidebar = false"
            >
              <div :class="sidebarLinkClass('/dashboard/orders')">
                <font-awesome-icon icon="shopping-basket" />
                <span>الطلبات</span>
              </div>
            </router-link>
            <router-link
              to="/dashboard/products"
              class="w-full"
              @click="showSidebar = false"
            >
              <div :class="sidebarLinkClass('/dashboard/products')">
                <font-awesome-icon icon="box-open" />
                <span>المنتجات</span>
              </div>
            </router-link>
            <router-link
              to="/dashboard/offers"
              class="w-full"
              @click="showSidebar = false"
            >
              <div :class="sidebarLinkClass('/dashboard/offers')">
                <font-awesome-icon icon="tags" />
                <span>العروض</span>
              </div>
            </router-link>
            <router-link
              to="/dashboard/reports"
              class="w-full"
              @click="showSidebar = false"
            >
              <div :class="sidebarLinkClass('/dashboard/reports')">
                <font-awesome-icon icon="chart-bar" />
                <span>التقارير</span>
              </div>
            </router-link>
            <router-link
              to="/dashboard/settings"
              class="w-full"
              @click="showSidebar = false"
            >
              <div :class="sidebarLinkClass('/dashboard/settings')">
                <font-awesome-icon icon="cog" />
                <span>إعدادات المتجر</span>
              </div>
            </router-link>
          </div>
        </aside>
      </div>
    </transition>
    <!-- سايد بار الديسكتوب -->
    <aside
      class="fixed top-0 hidden md:flex flex-col fixed h-screen w-1/5 bg-white text-black p-4 rounded-l-3xl shadow-2xl z-10"
      style="min-width: 180px; max-width: 320px; height: 100vh"
    >
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-blue-700 mb-6 text-center">
          لوحة التحكم
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
        class="flex-1 flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-1"
        style="font-size: 1rem"
      >
        <router-link to="/dashboard/orders" class="w-full">
          <div :class="sidebarLinkClass('/dashboard/orders')">
            <font-awesome-icon icon="shopping-basket" />
            <span>الطلبات</span>
          </div>
        </router-link>
        <router-link to="/dashboard/products" class="w-full">
          <div :class="sidebarLinkClass('/dashboard/products')">
            <font-awesome-icon icon="box-open" />
            <span>المنتجات</span>
          </div>
        </router-link>
        <router-link to="/dashboard/offers" class="w-full">
          <div :class="sidebarLinkClass('/dashboard/offers')">
            <font-awesome-icon icon="tags" />
            <span>العروض</span>
          </div>
        </router-link>
        <router-link to="/dashboard/reports" class="w-full">
          <div :class="sidebarLinkClass('/dashboard/reports')">
            <font-awesome-icon icon="chart-bar" />
            <span>التقارير</span>
          </div>
        </router-link>
        <router-link to="/dashboard/settings" class="w-full">
          <div :class="sidebarLinkClass('/dashboard/settings')">
            <font-awesome-icon icon="cog" />
            <span>إعدادات المتجر</span>
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

function sidebarLinkClass(path) {
  return [
    "py-3 px-4 min-w-[120px] rounded-xl text-base font-semibold transition cursor-pointer shadow-sm border flex items-center gap-2",
    $route.path === path
      ? "bg-gradient-to-l from-[#AFDBB0] to-[#0074AF] text-white font-bold border-blue-200"
      : "text-gray-700 hover:bg-gradient-to-l hover:from-[#AFDBB0] hover:to-[#0074AF] hover:text-white border-blue-50",
  ];
}
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
