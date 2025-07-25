<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
    @click.self="emit('update:modelValue', false)"
  >
    <div
      class="relative bg-white rounded-3xl shadow-2xl border border-blue-100 p-6 w-full max-w-md mx-4 animate-fade max-h-[80vh] overflow-y-auto"
    >
      <button
        class="absolute top-4 left-4 text-gray-400 hover:text-red-500 text-2xl transition-all duration-200 bg-gray-100 rounded-full p-2 shadow-md"
        @click="emit('update:modelValue', false)"
      >
        <font-awesome-icon icon="xmark" />
      </button>
      <h2 class="text-2xl font-bold mb-6 text-center text-blue-700">
        تصنيفات المنتجات
      </h2>
      <form @submit.prevent="addCategory" class="flex gap-2 mb-6">
        <input
          v-model="newCategory"
          type="text"
          placeholder="اسم التصنيف"
          class="border border-gray-300 rounded-xl px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-base"
          required
        />
        <button
          type="submit"
          class="bg-green-500 text-white px-6 py-2 rounded-xl hover:bg-green-600 transition text-base font-bold shadow-md"
        >
          إضافة
        </button>
      </form>
      <div v-if="categoryStore.loading" class="text-center text-gray-500 mb-4">
        جاري تحميل التصنيفات...
      </div>
      <div
        v-else-if="categoryStore.categories.length === 0"
        class="text-center text-gray-500 mb-4"
      >
        لا توجد تصنيفات حالياً
      </div>
      <ul v-else>
        <li
          v-for="category in categoryStore.categories"
          :key="category._id"
          class="flex justify-between items-center border-b py-2"
        >
          <div
            v-if="editCategoryId !== category._id"
            class="flex justify-between items-center w-full"
          >
            <span class="text-base">{{ category.name }}</span>
            <div class="flex gap-2">
              <button
                @click="startEditCategory(category)"
                class="text-blue-500 hover:text-blue-700 text-sm px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 transition font-bold"
              >
                تعديل
              </button>
              <button
                @click="categoryStore.deleteCategory(category._id)"
                class="text-red-500 hover:text-red-700 text-sm px-3 py-1 rounded-lg bg-red-50 hover:bg-red-100 transition font-bold"
              >
                حذف
              </button>
            </div>
          </div>
          <div v-else class="flex items-center gap-2 w-full">
            <input
              v-model="editCategoryName"
              type="text"
              class="border rounded-lg px-2 py-1 w-full"
            />
            <button
              @click="saveEditCategory"
              class="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 font-bold"
            >
              حفظ
            </button>
            <button
              @click="cancelEditCategory"
              class="bg-gray-300 px-3 py-1 rounded-lg font-bold"
            >
              إلغاء
            </button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from "vue";
import { useCategoriesStore } from "@/stores/categories";

const props = defineProps(["modelValue"]);
const emit = defineEmits(["update:modelValue"]);

const categoryStore = useCategoriesStore();
const newCategory = ref("");

const editCategoryId = ref(null);
const editCategoryName = ref("");

onMounted(() => {
  if (categoryStore.categories.length === 0) {
    categoryStore.fetchCategories();
  }
});

const addCategory = async () => {
  if (!newCategory.value.trim()) return;
  await categoryStore.createCategory({ name: newCategory.value.trim() });
  newCategory.value = "";
};

function startEditCategory(category) {
  editCategoryId.value = category._id;
  editCategoryName.value = category.name;
}

async function saveEditCategory() {
  if (!editCategoryName.value.trim() || !editCategoryId.value) return;
  await categoryStore.updateCategory(editCategoryId.value, {
    name: editCategoryName.value.trim(),
  });
  editCategoryId.value = null;
  editCategoryName.value = "";
}

function cancelEditCategory() {
  editCategoryId.value = null;
  editCategoryName.value = "";
}

// تعطيل السكرول عند فتح البوب أب
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      document.body.style.overflow = "hidden";
      categoryStore.fetchCategories();
    } else {
      document.body.style.overflow = "";
    }
  }
);

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
</style>
