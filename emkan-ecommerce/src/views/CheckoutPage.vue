<template>
  <div class="checkout-page container mx-auto p-4 md:p-8">
    <!-- Popup Modal -->
    <transition name="fade-pop">
      <div
        v-if="showPopup"
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm"
      >
        <div
          class="bg-white rounded-2xl shadow-2xl px-8 py-8 max-w-md w-full text-center border animate-popup"
        >
          <svg
            class="mx-auto mb-4 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            width="48"
            height="48"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="2"
              fill="#d1fae5"
            />
            <path stroke="#22c55e" stroke-width="2" d="M8 12l2 2 4-4" />
          </svg>
          <div class="text-green-700 font-bold text-lg mb-2">
            {{ popupMessage }}
          </div>
          <button
            @click="showPopup = false"
            class="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow"
          >
            إغلاق
          </button>
        </div>
      </div>
    </transition>

    <h1 class="text-3xl font-bold mb-6 text-center text-gray-800">الدفع</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Order Summary -->
      <div class="bg-white p-6 rounded-lg shadow-lg">
        <h2 class="text-2xl font-semibold mb-4 text-gray-700">ملخص الطلب</h2>
        <div
          v-if="!cartStore.cart || cartStore.cart.length === 0"
          class="text-gray-500"
        >
          سلة التسوق فارغة.
        </div>
        <div v-else>
          <ul>
            <li
              v-for="item in cartStore.cart"
              :key="item.product._id + '-' + item.price"
              class="flex justify-between items-center border-b py-3"
            >
              <div>
                <h3 class="font-medium text-gray-800">
                  {{ item.product.name }}
                </h3>
                <p class="text-sm text-gray-500">الكمية: {{ item.quantity }}</p>
              </div>
              <p class="text-lg font-semibold text-gray-700">
                {{ (item.price * item.quantity).toFixed(2) }}د.ل
              </p>
            </li>
          </ul>
          <div class="mt-4 pt-4 border-t">
            <div
              class="flex justify-between items-center text-xl font-bold text-gray-800"
            >
              <span>المجموع الإجمالي:</span>
              <span>{{ cartStore.total.toFixed(2) }} د.ل</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bank Account Details & Payment -->
      <div class="bg-white p-6 rounded-lg shadow-lg">
        <h2 class="text-2xl font-semibold mb-4 text-gray-700">معلومات الدفع</h2>
        <p class="mb-4 text-gray-600">
          يرجى تحويل المبلغ الإجمالي إلى حسابنا البنكي التالي:
        </p>
        <div class="bg-gray-50 p-4 rounded-md border border-gray-200 mb-6">
          <p class="mb-1">
            <strong class="text-gray-700">اسم البنك:</strong> بنك المثال
          </p>
          <p class="mb-1">
            <strong class="text-gray-700">اسم صاحب الحساب:</strong> مؤسسة إمكان
            التجارية
          </p>
          <p class="mb-1">
            <strong class="text-gray-700">رقم الحساب:</strong> 1234567890123456
          </p>
          <p>
            <strong class="text-gray-700">رقم الآيبان:</strong>
            SA0380000000608010167519
          </p>
        </div>

        <div class="mb-4">
          <label
            for="paymentNotes"
            class="block text-sm font-medium text-gray-700 mb-1"
            >ملاحظات إضافية (اختياري):</label
          >
          <textarea
            id="paymentNotes"
            v-model="paymentNotes"
            rows="3"
            class="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="مثال: يرجى التواصل قبل الشحن"
          ></textarea>
        </div>

        <button
          @click="handleCompleteTransfer"
          :disabled="
            !cartStore.cart || cartStore.cart.length === 0 || isLoading
          "
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <svg
            v-if="isLoading"
            class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span v-if="isLoading">جاري المعالجة...</span>
          <span v-else>تم التحويل</span>
        </button>
        <p v-if="orderError" class="text-red-500 text-sm mt-2">
          {{ orderError }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useCartStore } from "@/stores/cart";
import { useRouter } from "vue-router";

const cartStore = useCartStore();
const router = useRouter();
const paymentNotes = ref("");
const isLoading = ref(false);
const orderError = ref(null);
const showPopup = ref(false);
const popupMessage = ref("");

function triggerPopup(message) {
  popupMessage.value = message;
  showPopup.value = true;
  setTimeout(() => {
    showPopup.value = false;
  }, 2000);
}

async function handleCompleteTransfer() {
  console.log(
    "CheckoutPage: handleCompleteTransfer called. isLoading:",
    isLoading.value
  ); // <--- إضافة تسجيل
  if (isLoading.value) {
    // <--- منع الاستدعاءات المتعددة إذا كانت قيد المعالجة بالفعل
    console.log("CheckoutPage: Transfer already in progress, exiting.");
    return;
  }
  isLoading.value = true;
  orderError.value = null;
  try {
    if (!cartStore.cart || cartStore.cart.length === 0) {
      orderError.value = "سلة التسوق فارغة. لا يمكن إتمام الطلب.";
      isLoading.value = false;
      return;
    }
    console.log(
      "CheckoutPage: Calling cartStore.submitOrder. Cart items:",
      JSON.stringify(cartStore.cart)
    ); // <--- إضافة تسجيل
    await cartStore.submitOrder(paymentNotes.value);
    console.log("CheckoutPage: cartStore.submitOrder finished."); // <--- إضافة تسجيل
    // إظهار بوب أب تأكيد مخصص
    triggerPopup(
      "تم إرسال طلبك بنجاح! سيتم مراجعته والموافقة عليه من قبل الإدارة خلال وقت قصير."
    );
    setTimeout(() => {
      router.push({ name: "home" });
    }, 2000);
  } catch (error) {
    console.error("CheckoutPage: Failed to submit order:", error); // <--- إضافة تسجيل
    if (error.response && error.response.data && error.response.data.message) {
      orderError.value = error.response.data.message;
    } else {
      orderError.value = "حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.";
    }
  } finally {
    console.log(
      "CheckoutPage: handleCompleteTransfer finally block. isLoading set to false."
    ); // <--- إضافة تسجيل
    isLoading.value = false;
  }
}

// Fetch cart items if not already loaded (though typically they should be)
// Ensure cartStore.cart is checked for length
// if (cartStore.cart && cartStore.cart.length === 0 && !cartStore.isLoading) {
//   cartStore.fetchCart();
// }
</script>

<style scoped>
.checkout-page {
  min-height: calc(
    100vh - 200px
  ); /* Adjust based on your header/footer height */
}

/* Basic styling for disabled button */
button:disabled {
  cursor: not-allowed;
}

/* Animation for loading spinner */
.animate-spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Toast animation */
.fade-pop-enter-active,
.fade-pop-leave-active {
  transition: opacity 0.5s, transform 0.5s;
}
.fade-pop-enter {
  opacity: 0;
  transform: translateY(-10px);
}
.fade-pop-leave {
  opacity: 0;
  transform: translateY(10px);
}
</style>
