<template>
  <div class="bg-gray-100 rounded-b-xl shadow-lg shadow-gray-500">
    <!-- شريط التصنيفات يظهر على جميع الشاشات -->
    <div
      data-aos="fade-left"
      class="flex gap-4 overflow-x-auto py-4"
      style="font-size: 1rem"
    >
      <button
        :class="[
          'px-4 py-2 min-w-[120px] border rounded-full transition',
          selectedCategory === 'الكل'
            ? 'bg-gradient-to-l from-[#AFDBB0] to-[#0074AF] text-white font-bold shadow-lg'
            : 'bg-white hover:bg-blue-100',
        ]"
        @click="selectCategory('الكل')"
      >
        الكل
      </button>
      <button
        v-for="category in categoryStore.categories"
        :key="category._id"
        :class="[
          'px-4 py-2 min-w-[120px] border rounded-full transition',
          selectedCategory === category.name
            ? 'bg-gradient-to-l from-[#AFDBB0] to-[#0074AF] text-white font-bold shadow-lg'
            : 'bg-white hover:bg-blue-100',
        ]"
        @click="selectCategory(category.name)"
      >
        {{ category.name }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { useCategoriesStore } from "@/stores/categories";

const categoryStore = useCategoriesStore();

onMounted(() => {
  categoryStore.fetchCategories();
});

const props = defineProps({
  modelValue: Boolean,
  selectedCategory: {
    type: String,
    default: "الكل",
  },
});

const emit = defineEmits(["update:modelValue", "category-change"]);

const selectedCategory = ref(props.selectedCategory);

const selectCategory = (categoryName) => {
  selectedCategory.value = categoryName;
  emit("category-change", categoryName);
  emit("update:modelValue", false);
  setTimeout(() => {
    window.scrollBy({
      top: window.innerHeight * 1.9,
      left: 0,
      behavior: "smooth",
    });
  }, 200);
};

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
</script>

<style scoped>
.gradient-bg {
  background: linear-gradient(to right, #1b93ac, #7ae792);
}
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  background: #f1f1f1;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #b3e0d6;
  border-radius: 8px;
}
</style>
