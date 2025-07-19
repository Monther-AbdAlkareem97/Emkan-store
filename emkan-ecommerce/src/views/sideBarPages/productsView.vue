<template>
  <div
    class="p-4 pt-24 w-full md:w-4/5 min-h-screen absolute left-0 custom-dashboard-bg"
  >
    <div class="p-6">
      <!-- عنوان الصفحة وزر إضافة منتج -->
      <div class="flex justify-between items-center mb-8">
        <h1
          data-aos="fade-right"
          class="text-3xl font-extrabold text-gray-800 flex items-center gap-2"
        >
          <FontAwesomeIcon
            :icon="['fas', 'box-open']"
            class="w-8 h-8 text-blue-500"
          />
          المنتجات
        </h1>
        <button
          class="bg-white text-black px-6 py-2 rounded-full shadow-lg hover:scale-105 hover:shadow-xl font-bold text-lg transition-all duration-200 flex items-center gap-2"
          @click="openAddProduct"
        >
          <FontAwesomeIcon :icon="['fas', 'plus']" />
          إضافة منتج
        </button>
      </div>

      <!-- مربع البحث -->
      <div class="mb-6 flex items-center gap-3">
        <div class="relative w-full">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="ابحث عن منتج..."
            class="w-full px-5 py-3 border-2 border-blue-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm text-base pr-10"
          />
          <span class="absolute left-4 top-1/2 -translate-y-1/2">
            <FontAwesomeIcon
              :icon="['fas', 'search']"
              class="text-blue-400 text-lg"
            />
          </span>
        </div>
      </div>

      <!-- category navbar links-->
      <div class="flex flex-wrap gap-3 mb-8 border-b-4 pb-2">
        <button
          :class="[
            'text-sm font-bold px-4 py-2 rounded-full transition',
            selectedCategory === 'الكل'
              ? 'bg-gradient-to-l from-[\#afdbb0] to-[\#0074af] text-white shadow-lg'
              : 'bg-white text-gray-600 hover:bg-blue-50 border border-blue-100',
          ]"
          @click="selectCategory('الكل')"
        >
          الكل
        </button>
        <button
          v-for="category in categoriesStore.categories"
          :key="category._id"
          :class="[
            'text-sm font-bold px-4 py-2 rounded-full transition',
            selectedCategory === category.name
              ? 'bg-gradient-to-l from-[\#0074af] to-[\#afdbb0] text-white shadow-lg'
              : 'bg-white text-gray-600 hover:bg-blue-50 border border-blue-100',
          ]"
          @click="selectCategory(category.name)"
        >
          {{ category.name }}
        </button>
      </div>

      <!-- كروت المنتجات -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <div
          v-for="product in filteredProducts"
          :key="product._id"
          class="bg-white rounded-2xl shadow-xl overflow-hidden hover:scale-105 transition-all duration-200 group border border-blue-100 cursor-pointer relative"
          @click="editProduct(product)"
        >
          <!-- دائرة الكمية الإجمالية -->
          <span
            v-if="product.quantity > 0"
            class="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center shadow-lg z-10 border-2 border-white"
          >
            {{ product.quantity }}
          </span>
          <!-- دائرة الكمية المخفضة -->
          <span
            v-if="product.offer && product.offer.discountQuantity > 0"
            class="absolute top-14 left-3 bg-blue-600 text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center shadow-lg z-10 border-2 border-white"
          >
            {{ product.offer.discountQuantity }}
          </span>
          <img
            :src="
              product.image
                ? product.image.startsWith('http') ||
                  product.image.startsWith('/uploads')
                  ? product.image
                  : '/uploads/' + product.image
                : '/img/unnamed.webp'
            "
            :alt="product.name"
            class="w-full h-48 object-cover group-hover:opacity-90 transition-all duration-200"
          />

          <div class="p-5 flex flex-col gap-2">
            <h2
              class="text-lg font-bold mb-1 text-blue-800 flex items-center gap-2"
            >
              <FontAwesomeIcon :icon="['fas', 'box']" class="text-blue-400" />
              {{ product.name }}
            </h2>
            <p class="text-gray-700 mb-1">
              <span class="font-semibold">السعر:</span>
              <span v-if="product.discountPrice">
                <span class="line-through text-gray-400"
                  >{{ product.price }} د.ل</span
                >
                <span class="text-green-600 ml-2"
                  >{{ product.discountPrice }} د.ل</span
                >
              </span>
              <span v-else>{{ product.price }} د.ل</span>
            </p>
            <p class="text-gray-600 text-sm mb-1">
              {{ product.description || "لا يوجد وصف" }}
            </p>
            <p class="text-xs text-gray-400 mb-2 flex items-center gap-1">
              <FontAwesomeIcon
                :icon="['fas', 'tags']"
                class="text-yellow-400"
              />
              التصنيف:
              <span>{{ product.category?.name || "بدون تصنيف" }}</span>
            </p>
            <div class="flex justify-between items-center mt-2">
              <button
                class="flex items-center gap-1 text-[#0074af] hover:text-[#afdbb0] text-sm font-bold transition"
                @click.stop="editProduct(product)"
              >
                <FontAwesomeIcon :icon="['fas', 'edit']" /> تعديل
              </button>
              <button
                class="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm font-bold transition"
                @click.stop="deleteProduct(product._id)"
              >
                <FontAwesomeIcon :icon="['fas', 'trash']" /> حذف
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- نافذة إضافة/تعديل منتج -->
      <product-pop-up
        v-model="showAddProduct"
        :edit-product="editingProduct"
        @close="closeProductPopUp"
        @update:done="onProductPopUpDone"
        :key="editingProduct ? editingProduct._id : 'new'"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faBoxOpen,
  faBox,
  faTags,
  faEdit,
  faTrash,
  faPlus,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
library.add(faBoxOpen, faBox, faTags, faEdit, faTrash, faPlus, faSearch);
import { useProductsStore } from "@/stores/products";
import { useCategoriesStore } from "@/stores/categories";
import ProductPopUp from "@/components/dashboardComponent/cardsPopUpComponent/productPopUp.vue";

const productsStore = useProductsStore();
const categoriesStore = useCategoriesStore();

// استخدم searchQuery من store مباشرة
const searchQuery = productsStore.searchQuery;
const selectedCategory = ref("الكل");
const showAddProduct = ref(false);
const editingProduct = ref(null);

onMounted(() => {
  productsStore.fetchProducts();
  categoriesStore.fetchCategories();
});

const selectCategory = (cat) => {
  selectedCategory.value = cat;
};

const filteredProducts = computed(() => {
  let products = productsStore.filteredProducts;
  if (selectedCategory.value !== "الكل") {
    products = products.filter(
      (p) =>
        p.category &&
        (p.category.name === selectedCategory.value ||
          p.category === selectedCategory.value)
    );
  }
  return products;
});

function editProduct(product) {
  // تمرير نسخة عميقة من المنتج لضمان تعبئة جميع الحقول وعدم التأثير على الريفرنس الأصلي
  // الكمية الحقيقية = الكمية الأصلية فقط (بدون الكمية المخفضة)
  const productCopy = JSON.parse(JSON.stringify(product));
  productCopy.quantity = product.quantity; // اجلب فقط الكمية الأصلية
  editingProduct.value = productCopy;
  showAddProduct.value = true;
}

function openAddProduct() {
  editingProduct.value = null;
  showAddProduct.value = true;
}

function closeProductPopUp() {
  editingProduct.value = null;
  showAddProduct.value = false;
}

function onProductPopUpDone() {
  // إعادة تحميل المنتجات بعد التعديل أو الإضافة
  productsStore.fetchProducts();
  closeProductPopUp();
}

async function deleteProduct(id) {
  if (confirm("هل أنت متأكد من حذف المنتج؟")) {
    await productsStore.deleteProduct(id);
  }
}
</script>

<style scoped>
.custom-dashboard-bg {
  background: linear-gradient(to right, #0074af, #afdbb0);
}
</style>
