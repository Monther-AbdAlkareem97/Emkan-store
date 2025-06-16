<template>
  <div
    class="p-4 pt-28 w-full md:w-4/5 min-h-screen absolute left-0"
    style="background: linear-gradient(to right, #0074af, #afdbb0)"
  >
    <div class="p-6 bg-transparent min-h-screen">
      <!-- Header -->
      <div
        class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6"
      >
        <div class="flex items-center gap-2">
          <label for="from">من:</label>
          <input
            id="from"
            type="date"
            v-model="from"
            class="border border-gray-300 rounded-lg p-2 text-sm"
          />
          <label for="to">إلى:</label>
          <input
            id="to"
            type="date"
            v-model="to"
            class="border border-gray-300 rounded-lg p-2 text-sm"
          />
          <button
            @click="filterReports"
            class="bg-indigo-600 text-white rounded-lg px-4 py-2 hover:bg-indigo-700"
          >
            تصفية
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div
          class="bg-white p-4 rounded-xl shadow text-center text-lg font-semibold"
        >
          {{ reportsStore.stats.sales }} د.ل
        </div>
        <div
          class="bg-white p-4 rounded-xl shadow text-center text-lg font-semibold"
        >
          {{ reportsStore.stats.customers }} عميل
        </div>
        <div
          class="bg-white p-4 rounded-xl shadow text-center text-lg font-semibold"
        >
          {{ reportsStore.stats.completed }} مكتمل
        </div>
      </div>

      <!-- Chart -->
      <div class="bg-white p-4 rounded-xl shadow mb-6">
        <h2 class="text-lg font-semibold mb-2">المبيعات خلال الفترة</h2>
        <canvas id="salesChart"></canvas>
      </div>

      <!-- Top Products -->
      <div class="bg-white p-4 rounded-xl shadow">
        <h2 class="text-lg font-semibold mb-4">المنتجات الأكثر مبيعًا</h2>
        <ul class="divide-y">
          <li
            v-for="product in reportsStore.topProducts"
            :key="product.id"
            class="py-2 flex justify-between"
          >
            <span>{{ product.name }}</span>
            <span> {{ product.orders }} طلب</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useReportsStore } from "@/stores/reports";
import Chart from "chart.js/auto";

const reportsStore = useReportsStore();

const from = ref("");
const to = ref("");

let chartInstance = null;

const fetchReport = async () => {
  await reportsStore.fetchReports();
  renderChart(reportsStore.chart.labels, reportsStore.chart.data);
};

const filterReports = () => {
  fetchReport();
};

const renderChart = (labels = [], data = []) => {
  const ctx = document.getElementById("salesChart");
  if (chartInstance) chartInstance.destroy();
  chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "المبيعات (د.ل)",
          data: data,
          backgroundColor: "#60a5fa",
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: {
          ticks: {
            callback: function (value, index, ticks) {
              const label = labels[index] || "";
              const parts = label.split("-");
              return parts.length === 3 ? parts[2] : label;
            },
            maxRotation: 0,
            minRotation: 0,
            autoSkip: false,
            font: { size: 12 },
          },
        },
        y: { beginAtZero: true },
      },
    },
  });
};

onMounted(() => {
  fetchReport();
});
</script>

<style scoped>
/* تم نقل جميع تنسيقات @apply إلى الكلاسات مباشرة في عناصر القالب */
</style>
