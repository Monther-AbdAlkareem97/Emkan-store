<template>
  <div class="dashboard-content-wrapper absolute top-24 custom-dashboard-bg">
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 my-16">
      <!-- المنتجات -->
      <div
        data-aos="fade-down"
        @click="showProductPopup = true"
        class="dashboard-card group"
      >
        <div
          class="icon-circle bg-gradient-to-tr from-[#1b93ac] to-[#7ae792] group-hover:scale-110 flex items-center justify-center"
        >
          <FontAwesomeIcon
            :icon="['fas', 'box-open']"
            class="text-white text-2xl"
          />
        </div>
        <span class="dashboard-card-title">المنتجات</span>
      </div>
      <productPopUp v-model="showProductPopup" />

      <!-- الطلبات -->
      <div
        data-aos="fade-down"
        @click="showOrdersPopup = true"
        class="dashboard-card group relative"
      >
        <div
          class="icon-circle bg-gradient-to-tr from-[#7ae792] to-[#1b93ac] group-hover:scale-110 flex items-center justify-center relative"
        >
          <FontAwesomeIcon
            :icon="['fas', 'shopping-basket']"
            class="text-white text-2xl"
          />
          <span
            v-if="newOrdersCount > 0"
            class="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full px-2 py-0.5 shadow"
          >
            {{ newOrdersCount }}
          </span>
        </div>
        <span class="dashboard-card-title">الطلبات</span>
      </div>
      <ordersPopUp v-model="showOrdersPopup" />

      <!-- تصنيفات المنتجات -->
      <div
        data-aos="fade-down"
        @click="showCategoriesPopup = true"
        class="dashboard-card group"
      >
        <div
          class="icon-circle bg-gradient-to-tr from-[#f7b42c] to-[#fc575e] group-hover:scale-110 flex items-center justify-center"
        >
          <FontAwesomeIcon
            :icon="['fas', 'tags']"
            class="text-white text-2xl"
          />
        </div>
        <span class="dashboard-card-title">تصنيفات المنتجات</span>
      </div>
      <categoriesPopUp v-model="showCategoriesPopup" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faBoxOpen,
  faShoppingBasket,
  faTags,
} from "@fortawesome/free-solid-svg-icons";
import { useOrdersStore } from "@/stores/orders";
import { computed, watch } from "vue";

library.add(faBoxOpen, faShoppingBasket, faTags);

import productPopUp from "./cardsPopUpComponent/productPopUp.vue";
import ordersPopUp from "./cardsPopUpComponent/ordersPopUp.vue";
import categoriesPopUp from "./cardsPopUpComponent/categoriesPopUp.vue";

const showProductPopup = ref(false);
const showOrdersPopup = ref(false);
const showCategoriesPopup = ref(false);

const ordersStore = useOrdersStore();

const newOrdersCount = computed(
  () => ordersStore.orders.filter((o) => o.status === "awaiting_review").length
);

watch(
  () => ordersStore.orders.length,
  () => {},
  { immediate: true }
);

onMounted(() => {
  if (!ordersStore.orders.length) {
    ordersStore.fetchAllOrders();
  }
});
</script>

<style scoped>
.custom-dashboard-bg {
  background: linear-gradient(to right, #0074af, #afdbb0);
}
.dashboard-content-wrapper {
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  background: transparent;
  position: relative;
}
.dashboard-card {
  background: #fff;
  border-radius: 1.5rem;
  box-shadow: 0 4px 24px 0 rgba(30, 144, 255, 0.08),
    0 1.5px 6px 0 rgba(30, 144, 255, 0.04);
  padding: 2.5rem 1.5rem 1.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s;
  position: relative;
  min-height: 180px;
  border: none;
}
.dashboard-card:hover {
  box-shadow: 0 8px 32px 0 rgba(30, 144, 255, 0.16),
    0 3px 12px 0 rgba(30, 144, 255, 0.08);
  transform: translateY(-4px) scale(1.03);
}
.icon-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.2rem;
  box-shadow: 0 2px 8px 0 rgba(30, 144, 255, 0.1);
  transition: transform 0.2s;
}
.dashboard-card-title {
  font-size: 1.25rem;
  font-weight: bold;
  color: #222;
  letter-spacing: 0.5px;
}
:deep(.z-\[999999\]) {
  z-index: 2147483647 !important;
  position: fixed !important;
  pointer-events: auto !important;
}
:global(.z-\[999999\]) {
  z-index: 2147483647 !important;
  position: fixed !important;
  pointer-events: auto !important;
}
.dashboard-card,
.dashboard-card * {
  z-index: 1 !important;
}
:deep(.z-50),
:deep(.z-40),
:deep(.z-30) {
  z-index: 100 !important;
}
</style>
