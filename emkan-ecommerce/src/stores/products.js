// stores/productStore.js
import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";

export const useProductsStore = defineStore("product", () => {
  const products = ref([]);
  const product = ref(null);
  const loading = ref(false);
  const error = ref(null);

  const api = "http://localhost:5000/api/products";

  // جلب جميع المنتجات
  const fetchProducts = async () => {
    loading.value = true;
    try {
      const res = await axios.get(api);
      products.value = res.data;
    } catch (err) {
      error.value = err.response?.data?.error || "خطأ في جلب المنتجات";
    } finally {
      loading.value = false;
    }
  };

  // جلب منتج واحد
  const fetchProduct = async (id) => {
    loading.value = true;
    try {
      const res = await axios.get(`${api}/${id}`);
      product.value = res.data;
    } catch (err) {
      error.value = err.response?.data?.error || "خطأ في جلب المنتج";
    } finally {
      loading.value = false;
    }
  };

  // إنشاء منتج جديد
  const createProduct = async (newProduct) => {
    try {
      // نتحقق إذا كانت البيانات من نوع FormData
      const isFormData = newProduct instanceof FormData;

      const res = await axios.post(api, newProduct, {
        headers: isFormData
          ? { "Content-Type": "multipart/form-data" }
          : { "Content-Type": "application/json" },
      });

      products.value.push(res.data);
    } catch (err) {
      error.value = err.response?.data?.error || "خطأ في إنشاء المنتج";
    }
  };

  // تحديث منتج
  const updateProduct = async (id, updatedData) => {
    try {
      const isFormData = updatedData instanceof FormData;

      const res = await axios.put(`${api}/${id}`, updatedData, {
        headers: isFormData
          ? { "Content-Type": "multipart/form-data" }
          : { "Content-Type": "application/json" },
      });

      const index = products.value.findIndex((p) => p._id === id);
      if (index !== -1) products.value[index] = res.data;
    } catch (err) {
      error.value = err.response?.data?.error || "خطأ في تحديث المنتج";
    }
  };

  // حذف منتج
  const deleteProduct = async (id) => {
    try {
      await axios.delete(`${api}/${id}`);
      products.value = products.value.filter((p) => p._id !== id);
    } catch (err) {
      error.value = err.response?.data?.error || "خطأ في حذف المنتج";
    }
  };

  // إضافة أو تحديث تخفيض منتج
  const setProductOffer = async (id, offerData) => {
    try {
      const res = await axios.put(`${api}/${id}/offer`, offerData, {
        headers: { "Content-Type": "application/json" },
      });
      const index = products.value.findIndex((p) => p._id === id);
      if (index !== -1) products.value[index] = res.data;
    } catch (err) {
      error.value = err.response?.data?.error || "خطأ في تحديث التخفيض";
    }
  };

  return {
    products,
    product,
    loading,
    error,
    fetchProducts,
    fetchProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    setProductOffer, // إضافة الدالة الجديدة
  };
});
