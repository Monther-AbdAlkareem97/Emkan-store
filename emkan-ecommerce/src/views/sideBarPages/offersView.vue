<template>
  <div
    class="min-h-screen py-28 flex flex-col items-center"
    style="background: linear-gradient(to right, #0074af, #afdbb0)"
  >
    <div class="w-full max-w-3xl">
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center gap-3">
          <FontAwesomeIcon
            :icon="['fas', 'tags']"
            class="w-8 h-8 text-blue-600"
          />
          <h1 class="text-3xl font-extrabold text-blue-800">العروض</h1>
        </div>
        <!-- زر إضافة عرض جديد -->
        <button
          class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition duration-200"
          @click="openAddOfferPopup"
        >
          <FontAwesomeIcon :icon="['fas', 'plus']" class="w-5 h-5" />
          إضافة عرض جديد
        </button>
      </div>
      <div
        class="bg-white/80 rounded-2xl shadow-lg p-10 flex flex-col items-center"
      >
        <template v-if="discountedProducts.length > 0">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <div
              v-for="product in discountedProducts"
              :key="product._id"
              class="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col items-center shadow relative"
            >
              <img
                :src="
                  product.image
                    ? product.image.startsWith('http') ||
                      product.image.startsWith('/uploads')
                      ? product.image
                      : '/uploads/' + product.image
                    : '/img/unnamed.webp'
                "
                class="w-20 h-20 object-cover rounded-lg border mb-2"
              />
              <div class="font-bold text-blue-800 text-lg mb-1">
                {{ product.name }}
              </div>
              <div class="text-gray-500 text-sm mb-1">
                السعر الأصلي: {{ product.price }} د.ل
              </div>
              <div class="text-green-600 text-base font-bold mb-1">
                خصم {{ product.offer.discountValue }}% على
                {{ product.offer.discountQuantity }} قطعة
              </div>
              <div
                v-if="product.offer && product.offer.active"
                class="text-xs text-green-700 font-bold mb-2"
              >
                العرض مفعل
              </div>
              <div class="flex gap-2 mt-2">
                <button
                  class="px-3 py-1 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-white font-bold text-xs"
                  @click="editOffer(product)"
                >
                  تعديل
                </button>
                <button
                  class="px-3 py-1 rounded-lg font-bold text-xs"
                  :class="
                    product.offer.active
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  "
                  @click="toggleOfferActive(product)"
                >
                  {{ product.offer.active ? "إلغاء التفعيل" : "تفعيل" }}
                </button>
                <button
                  class="px-3 py-1 rounded-lg bg-red-700 hover:bg-red-800 text-white font-bold text-xs"
                  @click="deleteOffer(product)"
                >
                  حذف
                </button>
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <p class="text-gray-500 text-xl font-medium mb-2">
            لا توجد عروض متاحة حالياً.
          </p>
          <p class="text-gray-400">سيتم عرض العروض هنا عند توفرها.</p>
        </template>
      </div>
    </div>

    <!-- Popup Modal -->
    <div
      v-if="showPopup"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
      @click.self="showPopup = false"
    >
      <div
        class="bg-white rounded-3xl shadow-2xl p-0 w-full max-w-2xl relative flex flex-col overflow-hidden animate-fade"
      >
        <!-- رأس البوب اب -->
        <div
          class="flex items-center justify-between px-6 py-4 border-b"
          style="background: linear-gradient(to right, #0074af, #afdbb0)"
        >
          <h2 class="text-xl font-bold text-center flex-1">إدارة العروض</h2>
          <button
            @click="showPopup = false"
            class="text-gray-400 hover:text-red-500 text-2xl bg-gray-100 rounded-full shadow-md h-10 w-10 focus:outline-none focus:ring-2 focus:ring-blue-400"
            tabindex="0"
            @keyup.enter="showPopup = false"
            aria-label="إغلاق البوب أب"
          >
            <FontAwesomeIcon :icon="['fas', 'times']" />
          </button>
        </div>
        <!-- شريط التصنيفات -->
        <div
          class="flex gap-2 px-6 pt-4 overflow-x-auto pb-2 border-b bg-white sticky top-0 z-10"
        >
          <button
            :class="[
              'px-4 py-1 rounded-full font-bold text-sm transition whitespace-nowrap',
              selectedCategory === 'الكل'
                ? 'bg-blue-600 text-white shadow'
                : 'bg-gray-100 text-gray-700 hover:bg-blue-100',
            ]"
            @click="selectedCategory = 'الكل'"
          >
            الكل
          </button>
          <button
            v-for="cat in categoriesStore.categories"
            :key="cat._id"
            :class="[
              'px-4 py-1 rounded-full font-bold text-sm transition whitespace-nowrap',
              selectedCategory === cat._id
                ? 'bg-blue-600 text-white shadow'
                : 'bg-gray-100 text-gray-700 hover:bg-blue-100',
            ]"
            @click="selectedCategory = cat._id"
          >
            {{ cat.name }}
          </button>
        </div>
        <!-- كروت المنتجات -->
        <div
          class="grid grid-cols-2 md:grid-cols-3 gap-3 px-6 py-4 max-h-64 overflow-y-auto bg-white"
        >
          <template v-if="filteredProducts.length > 0">
            <div
              v-for="product in filteredProducts"
              :key="product._id"
              @click="selectedProductId = product._id"
              :class="[
                'cursor-pointer border rounded-xl p-2 flex flex-col items-center transition text-center h-full min-h-[120px] hover:shadow-md',
                selectedProductId === product._id
                  ? 'border-blue-600 ring-2 ring-blue-200 bg-blue-50 scale-105'
                  : 'border-gray-200 hover:border-blue-400',
              ]"
            >
              <img
                :src="
                  product.image
                    ? product.image.startsWith('http') ||
                      product.image.startsWith('/uploads')
                      ? product.image
                      : '/uploads/' + product.image
                    : '/img/unnamed.webp'
                "
                class="w-16 h-16 object-cover rounded-lg border mb-2"
              />

              <div class="font-bold text-gray-800 text-sm truncate w-full">
                {{ product.name }}
              </div>
              <div class="text-gray-500 text-xs">{{ product.price }} د.ل</div>
            </div>
          </template>
          <template v-else>
            <div
              class="col-span-full text-center text-gray-400 py-8 text-lg font-bold"
            >
              لا توجد منتجات لتخفيضها
            </div>
          </template>
        </div>
        <!-- نموذج إضافة عرض جديد -->
        <form
          @submit.prevent="isEditMode ? updateOffer() : addOffer()"
          class="px-6 pt-2 pb-6 bg-white border-t flex flex-col gap-3"
        >
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label class="block mb-1 font-semibold">قيمة الخصم (%)</label>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  @click="
                    discountValue = Math.max(1, Number(discountValue) - 1)
                  "
                  class="p-2 bg-gray-100 rounded-full text-blue-600 hover:bg-blue-200"
                >
                  <FontAwesomeIcon :icon="['fas', 'minus']" />
                </button>
                <input
                  v-model="discountValue"
                  type="number"
                  min="1"
                  max="100"
                  class="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-center"
                  required
                  style="max-width: 80px"
                />
                <button
                  type="button"
                  @click="
                    discountValue = Math.min(100, Number(discountValue) + 1)
                  "
                  class="p-2 bg-gray-100 rounded-full text-blue-600 hover:bg-blue-200"
                >
                  <FontAwesomeIcon :icon="['fas', 'plus']" />
                </button>
              </div>
            </div>
            <div>
              <label class="block mb-1 font-semibold"
                >كمية المنتج المخفضة</label
              >
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  @click="
                    discountQuantity = Math.max(1, Number(discountQuantity) - 1)
                  "
                  class="p-2 bg-gray-100 rounded-full text-blue-600 hover:bg-blue-200"
                >
                  <FontAwesomeIcon :icon="['fas', 'minus']" />
                </button>
                <input
                  v-model="discountQuantity"
                  type="number"
                  min="1"
                  :max="selectedProductMaxQuantity"
                  class="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-center"
                  required
                  placeholder="أدخل الكمية التي تريد تخفيضها"
                  style="max-width: 80px"
                />
                <button
                  type="button"
                  @click="
                    discountQuantity = Math.min(
                      selectedProductMaxQuantity || 9999,
                      Number(discountQuantity) + 1
                    )
                  "
                  class="p-2 bg-gray-100 rounded-full text-blue-600 hover:bg-blue-200"
                >
                  <FontAwesomeIcon :icon="['fas', 'plus']" />
                </button>
              </div>
              <div
                v-if="selectedProductMaxQuantity"
                class="text-xs text-gray-500 mt-1"
              >
                أقصى كمية متاحة: {{ selectedProductMaxQuantity }}
              </div>
            </div>
          </div>
          <div class="flex justify-end gap-2 mt-2">
            <button
              type="button"
              @click="showPopup = false"
              class="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700"
            >
              إلغاء
            </button>
            <button
              type="submit"
              class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              :disabled="!selectedProductId || !discountQuantity"
            >
              {{ isEditMode ? "تعديل" : "حفظ" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faTags, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useProductsStore } from "@/stores/products";
import { useCategoriesStore } from "@/stores/categories";
library.add(faTags, faPlus);
const showPopup = ref(false);
const selectedProductId = ref("");
const discountValue = ref("");
const discountQuantity = ref(1);
const productsStore = useProductsStore();
const categoriesStore = useCategoriesStore();
const selectedCategory = ref("الكل");
const isEditMode = ref(false);
const editProductId = ref("");

onMounted(() => {
  productsStore.fetchProducts();
  categoriesStore.fetchCategories();
});

const filteredProducts = computed(() => {
  if (selectedCategory.value === "الكل") return productsStore.products;
  // دعم ربط التصنيف بالمنتجات حسب category أو category._id
  return productsStore.products.filter((p) => {
    // بعض المنتجات قد يكون لديها category كـ object أو كـ id
    if (typeof p.category === "object" && p.category !== null) {
      return p.category._id === selectedCategory.value;
    }
    return p.category === selectedCategory.value;
  });
});

const selectedProductMaxQuantity = computed(() => {
  const product = productsStore.products.find(
    (p) => p._id === selectedProductId.value
  );
  if (!product) return null;
  // الكمية الأصلية المتاحة فقط بدون خصم = الكمية الحالية فقط
  // إذا كان هناك عرض مفعل، لا يمكن تخفيض أكثر من الكمية الأصلية المتاحة
  return product.quantity;
});

// المنتجات المخفضة (لقسم العروض)
const discountedProducts = computed(() =>
  productsStore.products
    .filter(
      (p) =>
        p.offer &&
        p.offer.active &&
        p.offer.discountValue > 0 &&
        p.offer.discountQuantity > 0
    )
    .map((p) => ({
      ...p,
      displayQuantity: p.offer.discountQuantity, // الكمية المخفضة فقط
    }))
);

// المنتجات العادية (بدون تخفيض أو المتبقي منها بدون تخفيض)
const normalProducts = computed(() =>
  productsStore.products
    .filter(
      (p) =>
        !p.offer ||
        !p.offer.active ||
        p.offer.discountQuantity === 0 ||
        p.quantity - (p.offer.discountQuantity || 0) > 0
    )
    .map((p) => ({
      ...p,
      displayQuantity: p.quantity - (p.offer?.discountQuantity || 0), // الكمية غير المخفضة
    }))
    .filter((p) => p.displayQuantity > 0)
);

function editOffer(product) {
  showPopup.value = true;
  isEditMode.value = true;
  editProductId.value = product._id;
  selectedProductId.value = product._id;
  discountValue.value = product.offer.discountValue;
  discountQuantity.value = product.offer.discountQuantity;
}

function toggleOfferActive(product) {
  productsStore.setProductOffer(product._id, {
    discountValue: product.offer.discountValue,
    discountQuantity: product.offer.discountQuantity,
    active: !product.offer.active,
  });
}

function addOffer() {
  const product = productsStore.products.find(
    (p) => p._id === selectedProductId.value
  );
  productsStore.setProductOffer(selectedProductId.value, {
    discountValue: Number(discountValue.value),
    discountQuantity: Number(discountQuantity.value),
    active: true,
  });
  alert(
    `تمت إضافة خصم ${discountValue.value}% للمنتج: ${
      product ? product.name : ""
    } على عدد ${discountQuantity.value} قطعة`
  );
  showPopup.value = false;
  discountValue.value = "";
  selectedProductId.value = "";
  discountQuantity.value = 1;
  isEditMode.value = false;
  editProductId.value = "";
}

function updateOffer() {
  productsStore.setProductOffer(editProductId.value, {
    discountValue: Number(discountValue.value),
    discountQuantity: Number(discountQuantity.value),
    active: true,
  });
  alert("تم تعديل العرض بنجاح");
  showPopup.value = false;
  discountValue.value = "";
  selectedProductId.value = "";
  discountQuantity.value = 1;
  isEditMode.value = false;
  editProductId.value = "";
}

function openAddOfferPopup() {
  showPopup.value = true;
  isEditMode.value = false;
  editProductId.value = "";
  discountValue.value = "";
  selectedProductId.value = "";
  discountQuantity.value = 1;
}

function deleteOffer(product) {
  if (confirm("هل أنت متأكد من حذف العرض لهذا المنتج؟")) {
    productsStore.setProductOffer(product._id, {
      discountValue: 0,
      discountQuantity: 0,
      active: false,
    });
  }
}
</script>

<style scoped>
.bg-white {
  background: #fff;
}
@keyframes fade {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade {
  animation: fade 0.3s ease-out;
}
</style>
