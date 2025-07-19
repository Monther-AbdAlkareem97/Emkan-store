<template>
  <!-- الشريط العلوي -->
  <div
    class="bg-gray-100 w-full h-20 flex justify-center items-center px-6 shadow-lg shadow-gray-500"
  >
    <!-- حقل البحث -->
    <div class="relative w-80">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="ابحث عن..."
        class="hover:shadow-2xl shadow-lg shadow-gray-300 w-full bg-white text-gray-700 placeholder-gray-400 rounded-full pl-5 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 shadow-sm"
      />
      <font-awesome-icon
        :icon="['fas', 'magnifying-glass']"
        class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
      />
    </div>
  </div>
</template>

<script setup>
import { useProductsStore } from "@/stores/products";
import { computed } from "vue";

const productsStore = useProductsStore();
const searchQuery = productsStore.searchQuery;
</script>

<style scoped>
.gradient-bg {
  background: linear-gradient(to right, #1b93ac, #7ae792);
}

/* حركة خفيفة للبوب أب */
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
.animate-fade {
  animation: fade 0.3s ease-out;
}
</style>
