<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
    @click.self="$emit('update:modelValue', false)"
  >
    <!-- Success Popup -->
    <transition name="fade">
      <div
        v-if="showSuccessPopup"
        class="fixed top-8 left-1/2 -translate-x-1/2 bg-green-500 text-white px-8 py-4 rounded-2xl shadow-lg text-lg font-bold z-[999999] flex items-center gap-2 animate-fade"
        style="min-width: 220px; text-align: center"
      >
        <font-awesome-icon icon="circle-check" class="text-2xl" />
        <span>{{ successMessage }}</span>
      </div>
    </transition>
    <div
      class="relative bg-white rounded-3xl shadow-2xl border border-blue-100 p-8 w-full max-w-2xl mx-4 animate-fade flex flex-col md:flex-row gap-10 items-center justify-center"
    >
      <button
        class="absolute top-4 left-4 text-gray-400 hover:text-red-500 text-2xl transition-all duration-200 bg-gray-100 rounded-full p-2 shadow-md"
        @click="$emit('update:modelValue', false)"
      >
        <font-awesome-icon icon="xmark" />
      </button>
      <!-- فورم المنتج -->
      <div
        class="flex flex-col gap-4 w-full max-w-xs text-gray-700 order-2 md:order-1"
      >
        <h1 class="text-2xl font-bold mb-2 text-blue-700 text-center">
          {{
            editProduct && editProduct._id ? "تعديل المنتج" : "إضافة منتج جديد"
          }}
        </h1>
        <input
          class="bg-gray-50 border border-gray-300 text-base rounded-xl p-3 focus:ring-2 focus:ring-blue-400 outline-none transition"
          type="text"
          placeholder="اسم المنتج"
          v-model="productInfo.name"
        />
        <p v-if="validationErrors.name" class="text-red-500 text-sm mt-1">
          {{ validationErrors.name }}
        </p>
        <input
          class="bg-gray-50 border border-gray-300 text-base rounded-xl p-3 focus:ring-2 focus:ring-blue-400 outline-none transition"
          type="text"
          placeholder="وصف المنتج"
          v-model="productInfo.description"
        />
        <p
          v-if="validationErrors.description"
          class="text-red-500 text-sm mt-1"
        >
          {{ validationErrors.description }}
        </p>
        <input
          class="bg-gray-50 border border-gray-300 text-base rounded-xl p-3 focus:ring-2 focus:ring-blue-400 outline-none transition"
          type="text"
          placeholder="سعر المنتج"
          v-model="productInfo.price"
        />
        <p v-if="validationErrors.price" class="text-red-500 text-sm mt-1">
          {{ validationErrors.price }}
        </p>
        <input
          class="no-spinner bg-gray-50 border border-gray-300 text-base rounded-xl p-3 focus:ring-2 focus:ring-blue-400 outline-none transition"
          type="number"
          placeholder="الكمية المتاحة"
          v-model="productInfo.quantity"
        />
        <p v-if="validationErrors.quantity" class="text-red-500 text-sm mt-1">
          {{ validationErrors.quantity }}
        </p>
        <div class="relative">
          <button
            type="button"
            class="bg-gray-50 border border-gray-300 text-base rounded-xl p-3 focus:ring-2 focus:ring-blue-400 outline-none transition w-full flex justify-between items-center"
            @click="showCategoryDropdown = !showCategoryDropdown"
          >
            <span>
              {{
                categoryStore.categories.find(
                  (c) => c._id === productInfo.category
                )?.name || "اختر الفئة"
              }}
            </span>
            <font-awesome-icon icon="chevron-down" class="text-gray-400" />
          </button>
          <div
            v-if="showCategoryDropdown"
            class="absolute z-10 left-0 right-0 bg-white border border-gray-200 rounded-xl mt-1 shadow-lg max-h-32 min-w-[150px] w-auto overflow-y-auto"
          >
            <div
              v-if="categoryStore.categories.length === 0"
              class="px-4 py-2 text-gray-400"
            >
              لا توجد تصنيفات متاحة
            </div>
            <button
              v-for="category in categoryStore.categories"
              :key="category._id"
              type="button"
              @click="
                productInfo.category = category._id;
                showCategoryDropdown = false;
              "
              :class="[
                'w-full text-right px-4 py-2 hover:bg-blue-50 rounded-xl transition',
                productInfo.category === category._id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700',
              ]"
            >
              {{ category.name }}
            </button>
          </div>
          <p v-if="validationErrors.category" class="text-red-500 text-sm mt-1">
            {{ validationErrors.category }}
          </p>
        </div>
        <button
          @click="saveProduct"
          :class="[
            editProduct && editProduct._id
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-green-600 hover:bg-green-700',
            'text-white font-bold py-3 px-6 rounded-xl mt-2 transition text-lg shadow-md',
          ]"
        >
          {{ editProduct && editProduct._id ? "تحديث المنتج" : "حفظ" }}
        </button>
      </div>
      <!-- صورة المنتج -->
      <div
        class="relative flex justify-center items-center bg-slate-100 w-full max-w-xs h-64 rounded-2xl shadow-inner border border-blue-100 order-1 md:order-2"
      >
        <img
          v-if="imagePreview"
          :src="imagePreview"
          class="object-contain w-full h-full rounded-2xl"
          alt="preview"
        />
        <font-awesome-icon
          v-else
          class="text-blue-400 h-24 w-24 pointer-events-none opacity-60"
          icon="square-plus"
        />
        <input
          class="absolute top-0 left-0 w-full h-full cursor-pointer opacity-0"
          type="file"
          placeholder="الصورة"
          accept="image/*"
          @change="handleImage"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, toRefs, onMounted, onBeforeUnmount } from "vue";
import { useProductsStore } from "@/stores/products";
import { useCategoriesStore } from "@/stores/categories";

const props = defineProps({
  modelValue: Boolean,
  editProduct: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["update:modelValue"]);

const categoryStore = useCategoriesStore();
const productStore = useProductsStore();

const productInfo = reactive({
  name: "",
  description: "",
  price: "",
  quantity: "",
  image: "",
  category: "",
});

const imagePreview = ref(null);
const showCategoryDropdown = ref(false);
const validationErrors = ref({});
const showSuccessPopup = ref(false);
const successMessage = ref("");

const handleImage = (event) => {
  const file = event.target.files[0];
  if (file && file.type.startsWith("image/")) {
    productInfo.image = file;
    imagePreview.value = URL.createObjectURL(file);
  } else {
    alert("يُسمح برفع الصور فقط");
  }
};

categoryStore.fetchCategories().then(() => {
  if (categoryStore.categories.length === 0) {
    alert("لا توجد تصنيفات متاحة. يرجى إضافة تصنيفات أولاً.");
  }
});

const validateProduct = () => {
  const errors = {};
  if (!productInfo.name.trim()) errors.name = "اسم المنتج مطلوب";
  if (!productInfo.description.trim()) errors.description = "وصف المنتج مطلوب";
  if (
    !productInfo.price ||
    isNaN(productInfo.price) ||
    Number(productInfo.price) <= 0
  )
    errors.price = "سعر المنتج يجب أن يكون رقمًا أكبر من الصفر";
  if (
    !productInfo.quantity ||
    isNaN(productInfo.quantity) ||
    Number(productInfo.quantity) <= 0
  )
    errors.quantity = "الكمية يجب أن تكون رقمًا أكبر من الصفر";
  if (!productInfo.category) errors.category = "يجب اختيار الفئة";
  return errors;
};

const showSuccess = (msg) => {
  successMessage.value = msg;
  showSuccessPopup.value = true;
  setTimeout(() => {
    showSuccessPopup.value = false;
  }, 2000);
};

const saveProduct = async () => {
  validationErrors.value = validateProduct();
  if (Object.keys(validationErrors.value).length > 0) {
    return;
  }

  // أرسل الكمية كما هي بدون أي طرح
  const formData = new FormData();
  formData.append("name", productInfo.name);
  formData.append("description", productInfo.description);
  formData.append("price", productInfo.price);
  formData.append("quantity", productInfo.quantity); // لا تطرح الكمية المخفضة
  formData.append("category", productInfo.category);
  if (productInfo.image) formData.append("image", productInfo.image);

  const isEdit = props.editProduct && props.editProduct._id;

  try {
    if (isEdit) {
      await productStore.updateProduct(props.editProduct._id, formData);
      await productStore.fetchProducts();
      showSuccess("تم تحديث المنتج بنجاح");
    } else {
      await productStore.createProduct(formData);
      await productStore.fetchProducts();
      showSuccess("تم إضافة المنتج بنجاح");
    }
    // أغلق البوب أب بعد ظهور رسالة النجاح
    setTimeout(() => {
      emit("update:modelValue", false);
    }, 2000);
  } catch (error) {
    console.error("خطأ في حفظ المنتج:", error);
    alert("حدث خطأ أثناء حفظ المنتج");
  }

  productInfo.name = "";
  productInfo.description = "";
  productInfo.price = "";
  productInfo.quantity = "";
  productInfo.image = "";
  productInfo.category = "";
  imagePreview.value = null;
};

// عند فتح البوب أب للتعديل، املأ الحقول من المنتج
watch(
  () => props.editProduct,
  (newVal) => {
    if (newVal) {
      productInfo.name = newVal.name || "";
      productInfo.description = newVal.description || "";
      productInfo.price = newVal.price || "";
      // عند التعديل: الكمية العادية فقط
      productInfo.quantity = Number(newVal.quantity) || 0;
      productInfo.category = newVal.category?._id || newVal.category || "";
      productInfo.image = ""; // لا تملأ الصورة بملف، فقط اتركها فارغة
      imagePreview.value = newVal.image
        ? newVal.image.startsWith("http") || newVal.image.startsWith("/uploads")
          ? newVal.image
          : `/uploads/${newVal.image}`
        : null;
    } else {
      // إعادة تعيين الحقول عند الإضافة
      productInfo.name = "";
      productInfo.description = "";
      productInfo.price = "";
      productInfo.quantity = "";
      productInfo.category = "";
      productInfo.image = "";
      imagePreview.value = null;
    }
  },
  { immediate: true }
);

// تعطيل السكرول عند فتح البوب أب
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }
);

// إعادة تفعيل السكرول عند تدمير المكون (لو حدث)
onBeforeUnmount(() => {
  document.body.style.overflow = "";
});
</script>

<style scoped>
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

.no-spinner::-webkit-outer-spin-button,
.no-spinner::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.no-spinner {
  -moz-appearance: textfield;
  appearance: none;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active in <2.1.8 */ {
  opacity: 0;
}
</style>
