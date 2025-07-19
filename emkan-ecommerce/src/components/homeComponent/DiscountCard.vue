<template>
  <div
    class="w-full bg-gray-100 p-5 rounded-xl double-shadow relative overflow-hidden mb-40"
  >
    <!-- العنوان وزر عرض الكل -->
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-bold text-gray-800">عروض الخصومات</h2>
      <a
        href="#"
        class="text-blue-600 hover:text-blue-800 text-base font-bold transition-colors duration-200 px-4 py-2 rounded-full"
      >
        عرض الكل
      </a>
    </div>

    <!-- الأسهم -->
    <button
      ref="prevEl"
      class="absolute left-1 top-1/2 -translate-y-1/2 z-20 bg-gray-100 shadow p-4 rounded-full text-4xl md:p-5 md:text-5xl"
    >
      <font-awesome-icon icon="chevron-left" />
    </button>
    <button
      ref="nextEl"
      class="absolute right-1 top-1/2 -translate-y-1/2 z-20 bg-gray-100 shadow p-4 rounded-full text-4xl md:p-5 md:text-5xl"
    >
      <font-awesome-icon icon="chevron-right" />
    </button>

    <!-- السلايدر -->
    <Swiper
      data-aos="fade-left"
      v-if="discountedProducts.length > 0"
      :modules="[Navigation, Autoplay]"
      :loop="true"
      :slides-per-view="1.1"
      :space-between="15"
      :breakpoints="{
        640: { slidesPerView: 2.1 },
        768: { slidesPerView: 3.1 },
        1024: { slidesPerView: 4 },
      }"
      :navigation="{ prevEl: prevEl, nextEl: nextEl }"
      :autoplay="{
        delay: 3500,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      }"
      class="px-4 sm:px-8 md:px-12"
    >
      <SwiperSlide
        v-for="product in discountedProducts"
        :key="product._id"
        @click="
          authStore.user && authStore.user.role === 'admin'
            ? null
            : availableQuantity(product) > 0 && openPopup(product)
        "
        class="m-5 bg-white rounded-2xl p-5 flex flex-col items-center text-center shadow-md relative group"
        :class="{
          'pointer-events-none opacity-60':
            authStore.user && authStore.user.role === 'admin',
        }"
      >
        <!-- Sold Out Ribbon -->
        <div
          v-if="availableQuantity(product) <= 0"
          class="absolute top-4 right-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full z-20 shadow-lg rotate-6"
        >
          نفذت الكمية
        </div>
        <div class="w-full aspect-square mb-4 flex items-center justify-center">
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
            class="w-full h-full object-contain transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-1 opacity-100"
            :style="
              availableQuantity(product) <= 0
                ? 'filter: grayscale(1) opacity(0.5);'
                : ''
            "
          />
        </div>
        <div class="w-full text-center mb-3">
          <h3 class="text-sm md:text-base font-semibold text-gray-800 mb-1">
            {{ product.name }}
          </h3>
          <p
            class="text-xs md:text-sm text-gray-500 mb-2 line-clamp-2 h-10 overflow-hidden"
          >
            {{ product.description }}
          </p>
        </div>
        <div class="w-full mt-auto flex justify-between">
          <span class="text-red-600 font-bold text-base md:text-lg block">
            <div>
              <span class="line-through text-gray-400 mr-2"
                >{{ product.price }} د.ل</span
              >
              <span class="inline-block w-2"></span>
              <span class="text-green-600">
                {{
                  (
                    product.price *
                    (1 - (product.offer.discountValue || 0) / 100)
                  ).toFixed(2)
                }}
                د.ل
              </span>
            </div>
          </span>
          <button
            class="relative group bg-gradient-to-l from-[#AFDBB0] to-[#0074AF] text-white text-xs md:text-sm px-4 py-2 rounded-full shadow-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
            @click.stop="openPopup(product)"
            :disabled="authStore.user && authStore.user.role === 'admin'"
          >
            <font-awesome-icon icon="cart-shopping" />
          </button>
        </div>
      </SwiperSlide>
    </Swiper>
    <div v-else class="flex items-center justify-center h-64">
      <h1>لا توجد عروض متاحة حاليًا.</h1>
    </div>

    <!-- نافذة المنتج (البوب-أب) -->
    <div
      v-if="selectedProduct"
      class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm transition-all duration-300"
      @click.self="closePopup"
    >
      <div
        class="relative bg-white rounded-2xl p-8 w-[90%] max-w-[400px] sm:max-w-[500px] md:max-w-[600px] text-center shadow-2xl border border-blue-100 animate-popup"
      >
        <button
          class="absolute top-3 left-3 text-gray-400 hover:text-red-500 text-2xl transition-all duration-200 bg-gray-100 rounded-full p-2 shadow-md"
          @click="closePopup"
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
          alt=""
          class="w-full h-52 object-contain mb-4 rounded-xl shadow-sm border"
        />

        <h3 class="text-2xl font-bold mb-2 text-blue-800">
          {{ selectedProduct.title || selectedProduct.name }}
          <span
            v-if="availableQuantity(selectedProduct) <= 0"
            class="text-xs bg-red-600 text-white rounded-full px-2 py-1 ml-2 align-middle"
            >نفذت الكمية</span
          >
        </h3>
        <p class="text-gray-600 mb-2 text-base">
          {{ selectedProduct.description }}
        </p>
        <div class="text-green-600 font-bold text-xl mb-4">
          <span class="line-through text-gray-400 mr-2"
            >{{ selectedProduct.price }} د.ل</span
          >
          <span class="inline-block w-2"></span>
          <span class="text-green-600">
            {{
              (
                selectedProduct.price *
                (1 - (selectedProduct.offer.discountValue || 0) / 100)
              ).toFixed(2)
            }}
            د.ل
          </span>
        </div>
        <div class="mb-4 flex flex-col items-center gap-2">
          <label for="quantity" class="text-sm font-semibold text-gray-700"
            >الكمية</label
          >
          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="quantity = Math.max(1, quantity - 1)"
              class="bg-gray-200 hover:bg-blue-100 text-blue-700 rounded-full w-8 h-8 flex items-center justify-center transition"
            >
              <font-awesome-icon icon="minus" />
            </button>
            <input
              v-model.number="quantity"
              type="number"
              id="quantity"
              min="1"
              :max="availableQuantity(selectedProduct)"
              class="w-16 text-center border-2 border-blue-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none transition"
            />
            <button
              type="button"
              @click="quantity++"
              :disabled="quantity >= availableQuantity(selectedProduct)"
              class="bg-gray-200 hover:bg-green-100 text-green-700 rounded-full w-8 h-8 flex items-center justify-center transition"
              :class="
                quantity >= availableQuantity(selectedProduct)
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
          class="mt-2 relative group bg-gradient-to-l from-[#AFDBB0] to-[#0074AF] text-white text-base px-8 py-3 rounded-full shadow-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center gap-2 mx-auto"
          @click="addToCart(selectedProduct, quantity)"
          :disabled="
            availableQuantity(selectedProduct) <= 0 ||
            (authStore.user && authStore.user.role === 'admin')
          "
          :class="
            availableQuantity(selectedProduct) <= 0 ||
            (authStore.user && authStore.user.role === 'admin')
              ? 'bg-gray-400 cursor-not-allowed opacity-60'
              : ''
          "
        >
          <font-awesome-icon icon="cart-shopping" />
          <span v-if="availableQuantity(selectedProduct) <= 0"
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
        <span class="text-green-700 font-bold truncate"
          >تمت إضافة {{ addedProductName }} للسلة بنجاح!</span
        >
      </div>
    </transition>

    <!-- Toast Notifications -->
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useProductsStore } from "@/stores/products";
import { useCartStore } from "@/stores/cart";
import { useAuthStore } from "@/stores/auth";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";

const prevEl = ref(null);
const nextEl = ref(null);
const selectedProduct = ref(null);
const quantity = ref(1);
const cartStore = useCartStore();
const authStore = useAuthStore();
const productsStore = useProductsStore();
const showAddedPopup = ref(false);
const addedProductName = ref("");
const showToast = ref(false);
const toastMessage = ref("");
const toastType = ref("success");

// حماية متقدمة: اجعل المنتجات دائماً مصفوفة حتى لو لم تحمل بعد
const discountedProducts = computed(() =>
  Array.isArray(productsStore.filteredProducts)
    ? productsStore.filteredProducts.filter(
        (p) =>
          p &&
          p.offer &&
          p.offer.active &&
          p.offer.discountValue > 0 &&
          p.offer.discountQuantity > 0
      )
    : []
);

const availableQuantity = (product) => {
  if (!product) return 0;
  let inCart = 0;
  if (cartStore.cartItems && Array.isArray(cartStore.cartItems)) {
    inCart = cartStore.cartItems
      .filter((item) => {
        const itemProductId = item.product?._id || item.productId || item._id;
        return itemProductId === product._id && !!item.isDiscounted;
      })
      .reduce((sum, item) => sum + (item.quantity || 0), 0);
  }
  return product.offer &&
    product.offer.active &&
    product.offer.discountQuantity > 0
    ? product.offer.discountQuantity - inCart
    : 0;
};

function openPopup(product) {
  selectedProduct.value = {
    ...product,
    requestedQuantity: 1,
  };
  quantity.value = 1;
}

function closePopup() {
  selectedProduct.value = null;
}

function triggerToast(message, type = "success") {
  toastMessage.value = message;
  toastType.value = type;
  showToast.value = true;
  setTimeout(() => {
    showToast.value = false;
  }, 3000);
}

const addToCart = async () => {
  if (!authStore.isLoggedIn) {
    window.location.href = "/login";
    return;
  }
  if (!selectedProduct.value) return;

  const currentProduct = selectedProduct.value;
  const modalInputQuantity = quantity.value || 1;

  const isDiscounted = true;
  const price =
    currentProduct.price *
    (1 - (currentProduct.offer?.discountValue || 0) / 100);

  // تحقق من الكمية في السلة
  const maxStock = currentProduct.offer?.discountQuantity || 0;
  const inCart =
    cartStore.cartItems && Array.isArray(cartStore.cartItems)
      ? cartStore.cartItems
          .filter((item) => {
            const itemProductId =
              item.product?._id || item.productId || item._id;
            return itemProductId === currentProduct._id && !!item.isDiscounted;
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

  const result = await cartStore.addToCart(
    currentProduct._id,
    modalInputQuantity,
    price,
    isDiscounted
  );

  if (result && result.success === true) {
    closePopup();
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
</script>

<style scoped>
.double-shadow {
  box-shadow: 0 -10px 15px -3px rgba(107, 114, 128),
    0 10px 15px -3px rgba(107, 114, 128);
}
@keyframes popup {
  0% {
    opacity: 0;
    transform: scale(0.85) translateY(40px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
.animate-popup {
  animation: popup 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-pop-enter-active,
.fade-pop-leave-active {
  transition: opacity 0.3s;
}
.fade-pop-enter-from,
.fade-pop-leave-to {
  opacity: 0;
}
.fade-pop-enter-to,
.fade-pop-leave-from {
  opacity: 1;
}
.animate-popup-success {
  animation: popup 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
