<template>
  <section
    class="min-h-[60vh] w-11/12 md:w-full max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl p-6 mt-10 mb-16 animate-fadeIn"
  >
    <h2
      class="text-2xl md:text-3xl font-extrabold mb-8 text-center flex items-center justify-center gap-2"
      style="color: #0074af"
    >
      <font-awesome-icon
        icon="cart-shopping"
        class="text-3xl"
        style="color: #afdbb0"
      />
      سلة التسوق
    </h2>
    <div
      v-if="cartStore.cart.length === 0 && !cartStore.loading"
      class="flex flex-col items-center justify-center py-16"
    >
      <font-awesome-icon
        icon="cart-shopping"
        class="text-6xl text-gray-300 mb-4"
      />
      <p class="text-lg text-gray-500 font-semibold">سلتك فارغة حالياً</p>
      <router-link
        to="/"
        class="mt-6 px-8 py-3 bg-gradient-to-l from-[#AFDBB0] to-[#0074AF] text-white rounded-full shadow-lg font-bold transition hover:scale-105 hover:shadow-xl"
        >تسوق الآن</router-link
      >
    </div>
    <div v-else class="">
      <div class="divide-y divide-blue-50 mb-8">
        <div
          v-for="(item, idx) in cartStore.cart"
          :key="`${item.product?._id || item.productId || item._id}-${
            item.price
          }`"
          class="flex items-center justify-between py-4"
        >
          <div class="flex items-center gap-4">
            <img
              :src="
                getProduct(item.product?._id || item.productId || item._id)
                  ?.image
                  ? getProduct(
                      item.product?._id || item.productId || item._id
                    ).image.startsWith('http')
                    ? getProduct(
                        item.product?._id || item.productId || item._id
                      ).image
                    : 'http://localhost:5000/' +
                      getProduct(
                        item.product?._id || item.productId || item._id
                      ).image
                  : '/img/unnamed.webp'
              "
              :alt="
                getProduct(item.product?._id || item.productId || item._id)
                  ?.name
              "
              class="w-20 h-20 object-contain rounded-xl border shadow"
            />
            <div>
              <h3 class="font-bold text-lg text-gray-800 mb-1">
                {{
                  getProduct(item.product?._id || item.productId || item._id)
                    ?.name || "---"
                }}
                <span
                  v-if="item.isDiscounted"
                  class="text-xs text-red-500 font-bold ml-2"
                  >(عرض مخفض)</span
                >
              </h3>
              <p class="font-semibold" style="color: #0074af">
                {{ Number(item.price).toFixed(2) }} د.ل
                <span
                  v-if="item.isDiscounted"
                  class="text-xs text-gray-400 line-through ml-2"
                >
                  {{
                    getProduct(item.product?._id || item.productId || item._id)
                      ?.price
                  }}
                  د.ل
                </span>
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="
                handleUpdateQuantity(item, Math.max(1, item.quantity - 1))
              "
              class="bg-gray-200 hover:bg-blue-100 text-blue-700 rounded-full w-8 h-8 flex items-center justify-center transition"
            >
              <font-awesome-icon icon="minus" />
            </button>
            <span class="w-8 text-center font-bold">{{ item.quantity }}</span>
            <button
              @click="handleUpdateQuantity(item, item.quantity + 1)"
              class="bg-gray-200 hover:bg-green-100 text-green-700 rounded-full w-8 h-8 flex items-center justify-center transition"
            >
              <font-awesome-icon icon="plus" />
            </button>
            <button
              @click="handleRemove(item)"
              class="text-red-500 hover:text-red-700 text-xl ml-2"
            >
              <font-awesome-icon icon="trash" />
            </button>
          </div>
        </div>
      </div>
      <div
        class="flex flex-col md:flex-row justify-between items-center gap-4 mt-8"
      >
        <div class="text-xl font-bold">
          المجموع: <span class="" style="color: #0074af">{{ total }} د.ل</span>
        </div>
        <router-link
          to="/"
          class="relative top-5 px-8 py-3 bg-gradient-to-l from-[#AFDBB0] to-[#0074AF] text-white rounded-full shadow-lg font-bold transition hover:scale-105 hover:shadow-xl"
          >تسوق الآن</router-link
        >
        <div class="mt-6 text-center">
          <p class="text-2xl font-semibold text-gray-800">
            المجموع الإجمالي: {{ cartStore.total.toFixed(2) }} د.ل
          </p>
          <router-link
            to="/checkout"
            class="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition duration-150 ease-in-out"
          >
            الانتقال إلى الدفع
          </router-link>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useCartStore } from "@/stores/cart";
import { useProductsStore } from "@/stores/products";

const cartStore = useCartStore();
const productsStore = useProductsStore();

onMounted(() => {
  cartStore.fetchCart();
  productsStore.fetchProducts();
});

// جلب بيانات المنتج من بينيا المنتجات
function getProduct(productId) {
  // دعم كل من id و _id وitem.product?._id
  return (
    productsStore.products.find(
      (p) => p.id === productId || p._id === productId
    ) || productsStore.products.find((p) => p._id === productId)
  );
}

function getCartItemPrice(item) {
  // إذا كان المنتج عليه خصم، أظهر السعر بعد الخصم
  const product = getProduct(item.product?._id || item.productId || item._id);
  if (product && product.offer && product.offer.discountValue > 0) {
    return (
      product.price *
      (1 - (product.offer.discountValue || 0) / 100)
    ).toFixed(2);
  }
  return item.price;
}

const total = computed(() =>
  cartStore.cart.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  )
);

async function handleUpdateQuantity(item, newQuantity) {
  const productId = item.product?._id || item.productId || item._id;
  const product = getProduct(productId);
  if (!product) {
    window.alert("تعذر العثور على بيانات المنتج.");
    return;
  }
  const isDiscounted = !!item.isDiscounted;
  // جمع كل الكميات لنفس المنتج حسب حالة الخصم فقط
  const similarItems = cartStore.cart.filter((i) => {
    const iProductId = i.product?._id || i.productId || i._id;
    return iProductId === productId && !!i.isDiscounted === isDiscounted;
  });
  // مجموع الكميات بعد التحديث
  const otherItemsTotal = similarItems.reduce(
    (sum, i) => sum + (i._id === item._id ? 0 : i.quantity),
    0
  );
  const totalRequested = newQuantity + otherItemsTotal;
  const maxAvailable = isDiscounted
    ? product.offer?.discountQuantity || 0
    : product.quantity || 0;
  if (totalRequested > maxAvailable) {
    window.alert(
      `الكمية المطلوبة غير متوفرة لهذا المنتج. الكمية المتاحة: ${
        maxAvailable - otherItemsTotal
      }`
    );
    return;
  }
  // إذا تحقق الشرط، أرسل التحديث للباك اند
  await cartStore.updateQuantity(item, newQuantity);
}

async function handleRemove(item) {
  // Pass the whole item object to the store function
  await cartStore.removeFromCart(item);
  // No need to fetchCart manually if the store updates the cart reactively
  // await cartStore.fetchCart();
}
</script>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
