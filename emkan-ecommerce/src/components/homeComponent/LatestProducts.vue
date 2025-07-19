<template>
  <section class="w-full bg-gray-100 p-6 rounded-xl double-shadow mb-10">
    <!-- العنوان -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800">المنتجات</h2>
    </div>

    <!-- شبكة المنتجات -->
    <transition-group
      data-aos="fade-up"
      name="fade-expand"
      tag="div"
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
    >
      <div
        v-for="product in displayedProducts"
        :key="product._id"
        @click="
          authStore.user && authStore.user.role === 'admin'
            ? null
            : availableQuantity(product) > 0 && openModal(product)
        "
        class="cursor-pointer bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-2xl p-5 flex flex-col items-center text-center shadow-md relative group"
        :class="{
          'pointer-events-none opacity-60':
            authStore.user && authStore.user.role === 'admin',
        }"
      >
        <!-- Sold Out Ribbon -->
        <div
          v-if="product.quantity === 0"
          class="absolute top-4 right-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full z-20 shadow-lg rotate-6"
        >
          الكمية غير متوفرة
        </div>
        <div
          v-else-if="availableQuantity(product) === 0"
          class="absolute top-4 right-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full z-20 shadow-lg rotate-6"
        >
          نفذت الكمية
        </div>
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
          class="w-full h-48 object-contain mb-4 rounded-lg"
        />

        <h3
          class="text-base md:text-lg font-bold text-gray-800 mb-1 line-clamp-1"
        >
          {{ product.name || "اسم المنتج" }}
        </h3>
        <p
          v-if="product.description"
          class="text-sm text-gray-500 mb-3 line-clamp-2"
        >
          {{ product.description }}
        </p>
        <div class="w-full mt-auto flex justify-between items-center">
          <span
            v-if="product.isDiscounted"
            class="text-red-600 font-bold text-lg flex flex-col items-end"
          >
            <span class="line-through text-gray-400 text-sm mb-1">
              {{ product.price }} د.ل
            </span>
            <span class="text-green-600">{{ product.discountPrice }} د.ل</span>
            <span
              v-if="product.discountPercent"
              class="text-xs text-white bg-red-500 rounded-full px-2 py-0.5 mt-1"
              >خصم {{ product.discountPercent }}%</span
            >
          </span>
          <span v-else class="text-red-600 font-bold text-lg"
            >{{ product.price }} د.ل</span
          >
          <button
            class="bg-gradient-to-l from-[#AFDBB0] to-[#0074AF] text-white text-sm px-4 py-2 rounded-full shadow-lg hover:scale-105 transition-all"
            @click.stop="openModal(product)"
            :disabled="authStore.user && authStore.user.role === 'admin'"
          >
            <font-awesome-icon icon="cart-shopping" />
          </button>
        </div>
      </div>
    </transition-group>

    <!-- زر عرض المزيد -->
    <div
      v-if="visibleCount < filteredProducts.length"
      class="flex justify-center mt-6"
    >
      <button
        class="bg-gradient-to-l from-[#AFDBB0] to-[#0074AF] text-white text-base px-8 py-3 rounded-full shadow-lg hover:scale-105 transition-all"
        @click="showMore"
      >
        <font-awesome-icon icon="arrow-right" class="ml-2" />
        عرض المزيد
      </button>
    </div>

    <!-- النافذة المنبثقة -->
    <div
      v-if="selectedProduct"
      class="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center backdrop-blur-sm"
      @click.self="closeModal"
    >
      <div
        class="relative bg-white rounded-2xl p-8 w-[90%] max-w-md sm:max-w-lg text-center shadow-2xl border animate-popup"
      >
        <button
          @click="closeModal"
          class="absolute top-3 left-3 text-gray-400 hover:text-red-500 text-2xl transition-all"
        >
          <font-awesome-icon icon="xmark" />
        </button>
        <img
          :src="
            selectedProduct.image
              ? selectedProduct.image.startsWith('http') ||
                selectedProduct.image.startsWith('/uploads')
                ? selectedProduct.image
                : '/uploads/' + selectedProduct.image
              : '/img/unnamed.webp'
          "
          alt="product image"
          class="w-full h-48 object-contain mb-4 rounded-xl border"
        />

        <h3 class="text-2xl font-bold text-blue-800 mb-2">
          {{ selectedProduct.title || selectedProduct.name }}
          <span
            v-if="availableQuantity(selectedProduct) === 0"
            class="text-xs bg-red-600 text-white rounded-full px-2 py-1 ml-2 align-middle"
            >نفذت الكمية</span
          >
        </h3>
        <p class="text-green-600 font-bold text-xl mb-4">
          {{ selectedProduct.price }} د.ل
        </p>
        <p class="text-gray-600 mb-4 text-sm">
          {{ selectedProduct.description || "هذا وصف تجريبي للمنتج." }}
        </p>

        <div class="mb-6">
          <label class="text-sm font-semibold text-gray-700 block mb-2"
            >الكمية</label
          >
          <div class="flex items-center justify-center gap-3">
            <button
              type="button"
              @click="modalQuantity = Math.max(1, modalQuantity - 1)"
              class="bg-gray-200 hover:bg-blue-100 text-blue-700 rounded-full w-8 h-8 flex items-center justify-center"
            >
              <font-awesome-icon icon="minus" />
            </button>
            <input
              v-model.number="modalQuantity"
              type="number"
              min="1"
              :max="availableQuantity(selectedProduct)"
              class="w-16 text-center border border-blue-300 rounded-lg p-2 bg-gray-100 text-gray-700"
              readonly
            />
            <button
              type="button"
              @click="
                modalQuantity = Math.min(
                  availableQuantity(selectedProduct),
                  modalQuantity + 1
                )
              "
              :disabled="modalQuantity >= availableQuantity(selectedProduct)"
              class="bg-gray-200 hover:bg-green-100 text-green-700 rounded-full w-8 h-8 flex items-center justify-center"
              :class="
                modalQuantity >= availableQuantity(selectedProduct)
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              "
            >
              <font-awesome-icon icon="plus" />
            </button>
          </div>
        </div>

        <!-- زر إضافة للسلة في البوب أب -->
        <button
          @click="addToCart"
          class="bg-gradient-to-l from-[#AFDBB0] to-[#0074AF] text-white text-base px-8 py-3 rounded-full shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2 mx-auto"
          :disabled="
            availableQuantity(selectedProduct) === 0 ||
            (authStore.user && authStore.user.role === 'admin')
          "
          :class="
            availableQuantity(selectedProduct) === 0 ||
            (authStore.user && authStore.user.role === 'admin')
              ? 'bg-gray-400 cursor-not-allowed opacity-60'
              : ''
          "
        >
          <font-awesome-icon icon="cart-shopping" />
          <span v-if="availableQuantity(selectedProduct) === 0"
            >نفذت الكمية</span
          >
          <span v-else-if="authStore.user && authStore.user.role === 'admin'"
            >غير متاح للأدمن</span
          >
          <span v-else>إضافة للسلة</span>
        </button>
      </div>
    </div>

    <!-- بوب أب إضافة للسلة -->
    <transition name="fade-pop">
      <div
        v-if="showAddedPopup"
        class="fixed z-[9999] top-8 left-1/2 -translate-x-1/2 bg-white border border-green-300 shadow-2xl rounded-2xl px-4 py-3 sm:px-8 sm:py-5 flex items-center gap-2 sm:gap-3 animate-popup-success min-w-[180px] max-w-[90vw] sm:max-w-fit text-xs sm:text-lg"
        style="max-width: 90vw"
      >
        <font-awesome-icon
          icon="circle-check"
          class="text-green-500 text-xl sm:text-2xl"
        />
        <span class="text-green-700 font-bold truncate">
          تمت إضافة {{ addedProductName }} للسلة بنجاح!
        </span>
      </div>
    </transition>

    <!-- Toast Notification -->
    <transition name="fade-pop">
      <div
        v-if="showToast"
        class="fixed z-[9999] top-20 left-1/2 -translate-x-1/2 px-4 py-3 sm:px-8 sm:py-5 flex items-center gap-2 sm:gap-3 animate-popup-success min-w-[180px] max-w-[90vw] sm:max-w-fit text-xs sm:text-lg rounded-2xl shadow-2xl border"
        :class="
          toastType === 'error'
            ? 'bg-red-50 border-red-300 text-red-700'
            : 'bg-green-50 border-green-300 text-green-700'
        "
        style="max-width: 90vw"
      >
        <font-awesome-icon
          :icon="toastType === 'error' ? 'circle-xmark' : 'circle-check'"
          :class="toastType === 'error' ? 'text-red-500' : 'text-green-500'"
          class="text-xl sm:text-2xl"
        />
        <span class="font-bold truncate">{{ toastMessage }}</span>
      </div>
    </transition>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useProductsStore } from "@/stores/products";
import { useCartStore } from "@/stores/cart";
import { useAuthStore } from "@/stores/auth";

const props = defineProps({
  selectedCategory: {
    type: String,
    default: "الكل",
  },
});

const productsStore = useProductsStore();
const cartStore = useCartStore();
const authStore = useAuthStore();

const productsPerRow = 4;
const visibleCount = ref(productsPerRow);

// حماية عند التحميل الأول حتى لو products undefined
const filteredProducts = computed(() => {
  // تأكد أن المنتجات مصفوفة وليس undefined
  let source = Array.isArray(productsStore.filteredProducts)
    ? productsStore.filteredProducts
    : [];
  // تصفية حسب التصنيف
  if (props.selectedCategory !== "الكل") {
    source = source.filter(
      (product) =>
        product &&
        product.category &&
        (product.category.name === props.selectedCategory ||
          product.category === props.selectedCategory)
    );
  }
  // استبعاد المنتجات المخفضة
  return source.filter(
    (product) =>
      product &&
      !(
        product.offer &&
        product.offer.active &&
        product.offer.discountValue > 0 &&
        product.offer.discountQuantity > 0
      )
  );
});

// حماية نفسية: لو filteredProducts رجع undefined أو null
const displayedProducts = computed(() =>
  Array.isArray(filteredProducts.value)
    ? filteredProducts.value
        .filter((product) => product && product._id)
        .slice(0, visibleCount.value)
    : []
);

const selectedProduct = ref(null);
const modalQuantity = ref(1); // استخدمه بدل requestedQuantity

const showAddedPopup = ref(false);
const addedProductName = ref("");
const toastMessage = ref("");
const showToast = ref(false);
const toastType = ref("success");

onMounted(() => {
  productsStore.fetchProducts();
});

function triggerToast(message, type = "success") {
  toastMessage.value = message;
  toastType.value = type;
  showToast.value = true;
  setTimeout(() => {
    showToast.value = false;
  }, 3000);
}

const openModal = (product) => {
  if (!product) return;
  selectedProduct.value = { ...product };
  modalQuantity.value = 1;
};

const closeModal = () => {
  selectedProduct.value = null;
  modalQuantity.value = 1;
};

const addToCart = async () => {
  if (!authStore.isLoggedIn) {
    window.location.href = "/login";
    return;
  }
  if (!selectedProduct.value) return;

  const currentProduct = selectedProduct.value;
  const modalInputQuantity = modalQuantity.value || 1;

  const maxStock = currentProduct.quantity || 0;

  // تحقق من الكمية في السلة
  const inCart = Array.isArray(cartStore.cartItems)
    ? cartStore.cartItems
        .filter((item) => {
          const itemProductId = item.product?._id || item.productId || item._id;
          return itemProductId === currentProduct._id && !item.isDiscounted;
        })
        .reduce((sum, item) => sum + (item.quantity || 0), 0)
    : 0;

  if (modalInputQuantity + inCart > maxStock) {
    triggerToast(
      `الكمية المطلوبة غير متوفرة! يمكنك إضافة فقط ${
        maxStock - inCart
      } من هذا المنتج.`,
      "error"
    );
    return;
  }

  const price = currentProduct.price;

  const result = await cartStore.addToCart(
    currentProduct._id,
    modalInputQuantity,
    price,
    false // ليس مخفض
  );

  if (result && result.success === true) {
    closeModal();
    showAddedPopup.value = true;
    addedProductName.value = currentProduct.name;
    setTimeout(() => {
      showAddedPopup.value = false;
    }, 3000);
    await cartStore.fetchCart();
  } else {
    triggerToast(
      result && result.message
        ? result.message
        : "حدث خطأ أثناء إضافة المنتج للسلة",
      "error"
    );
  }
};

const showMore = () => {
  visibleCount.value += productsPerRow;
};

const availableQuantity = (product) => {
  if (!product) return 0;
  if (!Array.isArray(cartStore.cartItems)) return product.quantity || 0;
  const totalInCart = cartStore.cartItems
    .filter((item) => {
      const itemProductId = item.product?._id || item.productId || item._id;
      return itemProductId === product._id && !item.isDiscounted;
    })
    .reduce((sum, item) => sum + (item.quantity || 0), 0);
  return (product.quantity || 0) - totalInCart;
};
</script>

<style scoped>
.double-shadow {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.1) !important;
}

.animate-popup {
  animation: popup 0.4s ease-out;
}

@keyframes popup {
  0% {
    transform: scale(0.9);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.fade-expand-enter,
.fade-expand-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.fade-expand-enter-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-expand-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.fade-pop-enter,
.fade-pop-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-pop-enter-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-pop-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
</style>
