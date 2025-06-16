<template>
  <div class="min-h-screen">
    <!-- تمرير v-model للتحكم في حالة السايد بار -->

    <NavBar v-model="isSidebarOpen" />
    <SearchBarSection />
    <CategoriesBar
      v-model="isSidebarOpen"
      :selected-category="selectedCategory"
      @category-change="handleCategoryChange"
    />
    <BannerSlider />
    <DiscountCard />
    <LatestProducts
      v-model="isSidebarOpen"
      :selected-category="selectedCategory"
    />
    <Footer />

    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>

    <button
      v-show="showScrollTop"
      @click="scrollToTop"
      class="fixed bottom-8 right-8 z-[9999] bg-gradient-to-l from-[#AFDBB0] to-[#0074AF] text-white rounded-full shadow-lg w-14 h-14 flex items-center justify-center text-3xl transition-all duration-300 hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
      aria-label="العودة للأعلى"
      style="direction: ltr"
    >
      <font-awesome-icon :icon="['fas', 'arrow-up']" />
    </button>
  </div>
</template>

<script setup>
import NavBar from "@/components/homeComponent/navBar.vue";
import SearchBarSection from "@/components/homeComponent/searchBarSection.vue";
import CategoriesBar from "@/components/homeComponent/CategoriesBar.vue";
import BannerSlider from "@/components/homeComponent/BannerSlider.vue";
import DiscountCard from "@/components/homeComponent/DiscountCard.vue";
import LatestProducts from "@/components/homeComponent/LatestProducts.vue";
import Footer from "@/components/homeComponent/footer.vue";

import { ref, onMounted, onUnmounted } from "vue";

// حالة السايد بار
const isSidebarOpen = ref(false);
// التصنيف المختار
const selectedCategory = ref("الكل");

// دالة تحديث التصنيف المختار من CategoriesBar
function handleCategoryChange(category) {
  selectedCategory.value = category;
}

// حالة زر العودة للأعلى
const showScrollTop = ref(false);

function handleScroll() {
  showScrollTop.value = window.scrollY > 200;
}

// دالة التمرير للأعلى
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
});
onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>
