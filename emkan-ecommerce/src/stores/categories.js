import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";

export const useCategoriesStore = defineStore("categories", () => {
  const categories = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const api = "/api/categories";

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

  const updateCategory = async (id, data) => {
    try {
      const res = await axios.put(`${api}/${id}`, data);
      const index = categories.value.findIndex((cat) => cat._id === id);
      if (index !== -1) {
        categories.value[index] = res.data;
      }
    } catch (err) {
      error.value = err.response?.data?.message || "خطأ في تعديل التصنيف";
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
    updateCategory,
    addNewCategory,
  };
});
