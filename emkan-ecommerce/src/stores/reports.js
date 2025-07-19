import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";

export const useReportsStore = defineStore("reports", () => {
  const stats = ref({ orders: 0, sales: 0, customers: 0, completed: 0 });
  const topProducts = ref([]);
  const chart = ref({ labels: [], data: [] });
  const loading = ref(false);
  const error = ref(null);

  const fetchReports = async () => {
    loading.value = true;
    error.value = null;
    try {
      const res = await axios.get("/api/reports", {
        withCredentials: true,
      });
      stats.value = res.data.stats || {
        orders: 0,
        sales: 0,
        customers: 0,
        completed: 0,
      };
      topProducts.value = res.data.topProducts || [];
      chart.value = res.data.chart || { labels: [], data: [] };
    } catch (err) {
      error.value = err.response?.data?.message || err.message;
    } finally {
      loading.value = false;
    }
  };

  return {
    stats,
    topProducts,
    chart,
    loading,
    error,
    fetchReports,
  };
});
