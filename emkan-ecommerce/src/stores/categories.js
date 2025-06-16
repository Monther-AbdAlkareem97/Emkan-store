import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";

export const useCategoriesStore = defineStore("categories", () => {
  const categories = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const api = "http://localhost:5000/api/categories";

  const fetchCategories = async () => {
    loading.value = true;
    error.value = null;
    try {
      const res = await axios.get(api);
      categories.value = res.data;
    } catch (err) {
      error.value = err.response?.data?.message || "خطأ في جلب التصنيفات";
    } finally {
      loading.value = false;
    }
  };

  const createCategory = async (data) => {
    try {
      const res = await axios.post(api, data);
      categories.value.push(res.data);
    } catch (err) {
      error.value = err.response?.data?.message || "خطأ في إنشاء التصنيف";
    }
  };

  const deleteCategory = async (id) => {
    try {
      await axios.delete(`${api}/${id}`);
      categories.value = categories.value.filter((cat) => cat._id !== id);
    } catch (err) {
      error.value = err.response?.data?.message || "خطأ في حذف التصنيف";
    }
  };

  // دعم إضافة تصنيف من البوب أب القديم
  const addNewCategory = createCategory;

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    deleteCategory,
    addNewCategory,
  };
});
