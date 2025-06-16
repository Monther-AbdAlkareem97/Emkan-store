<template>
  <div
    class="relative z-5 settings-modern min-h-screen py-10 px-2 md:px-10 flex flex-col items-center justify-start"
    style="min-height: calc(100vh - 64px)"
  >
    <div class="w-full max-w-5xl mx-auto mt-8">
      <h1
        class="text-4xl font-black text-center text-blue-700 mb-10 tracking-tight flex items-center justify-center gap-3"
      >
        <font-awesome-icon icon="cog" class="text-green-500 text-3xl" />
        إعدادات المتجر
      </h1>
      <!-- تبويبات أفقية عصرية -->
      <div class="flex flex-wrap justify-center gap-4 mb-10">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          :class="[
            'flex flex-col items-center px-6 py-3 rounded-2xl shadow transition-all duration-200',
            activeTab === tab.key
              ? 'bg-gradient-to-r from-green-400 to-blue-400 text-white scale-105 shadow-lg'
              : 'bg-white text-blue-700 hover:bg-blue-50',
          ]"
        >
          <span
            class="flex items-center justify-center w-12 h-12 rounded-full mb-2 text-2xl"
            :class="activeTab === tab.key ? 'bg-white/20' : 'bg-blue-100'"
          >
            <font-awesome-icon :icon="tab.icon" />
          </span>
          <span class="font-bold text-base">{{ tab.label }}</span>
        </button>
      </div>

      <!-- محتوى الإعدادات -->
      <div class="relative grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- إعدادات عامة -->
        <div v-if="activeTab === 'general'" class="modern-card md:order-2">
          <div
            class="modern-card-header bg-gradient-to-r from-blue-100 to-green-100"
          >
            <font-awesome-icon
              icon="sliders-h"
              class="text-blue-500 text-2xl"
            />
            <span>إعدادات عامة</span>
          </div>
          <div class="modern-card-body">
            <label class="modern-label">اسم المتجر</label>
            <input
              type="text"
              v-model="storeName"
              class="modern-input"
              placeholder="اسم متجرك..."
            />
            <label class="modern-label mt-4"
              >البريد الإلكتروني العام للمتجر</label
            >
            <input
              type="email"
              v-model="supportEmail"
              class="modern-input"
              placeholder="store@email.com"
            />
            <p class="text-xs text-gray-500 mt-2">
              سيتم استخدام هذا البريد في جميع مراسلات المتجر مع العملاء.
            </p>
          </div>
        </div>

        <!-- المستخدمون والصلاحيات -->
        <div v-if="activeTab === 'users'" class="modern-card">
          <div
            class="modern-card-header bg-gradient-to-r from-yellow-100 to-yellow-200"
          >
            <font-awesome-icon
              icon="users-cog"
              class="text-yellow-500 text-2xl"
            />
            <span>المستخدمون والصلاحيات</span>
          </div>
          <div class="modern-card-body">
            <label class="modern-label">اختر المستخدم</label>
            <select v-model="selectedUser" class="modern-input">
              <option disabled value="">-- اختر مستخدم --</option>
              <option v-for="user in users" :key="user.id" :value="user">
                {{ user.name }}
              </option>
            </select>
            <div v-if="selectedUser" class="mt-4">
              <div class="font-bold text-yellow-700 mb-2">
                صلاحيات {{ selectedUser.name }}
              </div>
              <div class="flex flex-wrap gap-2">
                <label
                  v-for="permission in permissions"
                  :key="permission"
                  class="modern-checkbox"
                >
                  <input
                    type="checkbox"
                    :value="permission"
                    v-model="selectedPermissions"
                  />
                  <span>{{ permission }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- إعدادات الطلبات -->
        <div v-if="activeTab === 'orders'" class="modern-card">
          <div
            class="modern-card-header bg-gradient-to-r from-green-100 to-blue-100"
          >
            <font-awesome-icon icon="clock" class="text-green-500 text-2xl" />
            <span>إعدادات الطلبات</span>
          </div>
          <div class="modern-card-body">
            <label class="modern-label">مدة صلاحية الطلب (بالدقائق)</label>
            <input
              v-model="orderExpirationMinutes"
              type="number"
              min="1"
              class="modern-input"
            />
          </div>
        </div>

        <!-- إعدادات الدفع -->
        <div v-if="activeTab === 'payment'" class="modern-card">
          <div
            class="modern-card-header bg-gradient-to-r from-blue-100 to-blue-200"
          >
            <font-awesome-icon
              icon="credit-card"
              class="text-blue-500 text-2xl"
            />
            <span>إعدادات الدفع</span>
          </div>
          <div class="modern-card-body">
            <label class="modern-label">طريقة الدفع الافتراضية</label>
            <select v-model="defaultPayment" class="modern-input">
              <option value="cash">نقداً عند الاستلام</option>
              <option value="bank">تحويل بنكي</option>
              <option value="online">دفع إلكتروني</option>
            </select>
            <div class="flex items-center gap-2 mt-4">
              <input
                type="checkbox"
                v-model="enableOnlinePayment"
                class="form-checkbox text-blue-500"
              />
              <span class="text-gray-700">تفعيل الدفع الإلكتروني</span>
            </div>
          </div>
        </div>

        <!-- إعدادات الإشعارات -->
        <div v-if="activeTab === 'notifications'" class="modern-card">
          <div
            class="modern-card-header bg-gradient-to-r from-pink-100 to-pink-200"
          >
            <font-awesome-icon icon="bell" class="text-pink-500 text-2xl" />
            <span>إعدادات الإشعارات</span>
          </div>
          <div class="modern-card-body">
            <div class="flex items-center gap-2">
              <input
                type="checkbox"
                v-model="enableOrderNotifications"
                class="form-checkbox text-pink-500"
              />
              <span class="text-gray-700">تفعيل إشعارات الطلبات الجديدة</span>
            </div>
          </div>
        </div>
      </div>

      <!-- زر الحفظ -->
      <div class="text-center pt-10 mt-10">
        <button @click="saveSettings" class="modern-save-btn">
          <font-awesome-icon icon="save" class="text-xl" /> حفظ الإعدادات
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faCog,
  faSlidersH,
  faUsersCog,
  faClock,
  faCreditCard,
  faBell,
  faSave,
} from "@fortawesome/free-solid-svg-icons";
library.add(
  faCog,
  faSlidersH,
  faUsersCog,
  faClock,
  faCreditCard,
  faBell,
  faSave
);

const tabs = [
  { key: "general", label: "إعدادات عامة", icon: "sliders-h" },
  { key: "users", label: "المستخدمون والصلاحيات", icon: "users-cog" },
  { key: "orders", label: "الطلبات", icon: "clock" },
  { key: "payment", label: "الدفع", icon: "credit-card" },
  { key: "notifications", label: "الإشعارات", icon: "bell" },
];
const activeTab = ref("general");

// إعدادات عامة
const storeName = ref("");
const supportEmail = ref("");

// المستخدمون والصلاحيات
const users = ref([
  { id: 1, name: "أحمد محمد" },
  { id: 2, name: "سارة خالد" },
  { id: 3, name: "زياد عبدالله" },
]);
const selectedUser = ref(null);
const permissions = ref([
  "إدارة المنتجات",
  "إدارة الطلبات",
  "إدارة المستخدمين",
  "إعدادات عامة",
  "التقارير",
]);
const selectedPermissions = ref([]);

// الطلبات
const orderExpirationMinutes = ref(30);

// الدفع
const defaultPayment = ref("cash");
const enableOnlinePayment = ref(false);

// الإشعارات
const enableOrderNotifications = ref(true);

const saveSettings = () => {
  alert("✅ تم حفظ الإعدادات بنجاح!");
};
</script>

<style scoped>
.settings-modern {
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(to right, #0074af, #afdbb0);
  /* توزيع أفضل للطبقات */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 32px;
}
.modern-card {
  background: #fff;
  border-radius: 2rem;
  box-shadow: 0 4px 24px 0 #0001;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  margin-bottom: 2rem;
}
.modern-card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.2rem;
  font-weight: bold;
  padding: 1.2rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}
.modern-card-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}
.modern-label {
  font-weight: 600;
  color: #2563eb;
  margin-bottom: 0.5rem;
  display: block;
}
.modern-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  border: 1px solid #d1d5db;
  outline: none;
  font-size: 1rem;
  transition: border 0.2s;
  margin-bottom: 0.5rem;
}
.modern-input:focus {
  border-color: #22c55e;
  box-shadow: 0 0 0 2px #bbf7d0;
}
.modern-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f9fafb;
  border-radius: 1rem;
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, border 0.2s;
}
.modern-checkbox input[type="checkbox"] {
  accent-color: #f59e42;
}
.modern-checkbox:hover {
  background: #f3f4f6;
  border-color: #f59e42;
}
.modern-save-btn {
  background: linear-gradient(90deg, #22c55e 0%, #2563eb 100%);
  color: #fff;
  font-weight: bold;
  padding: 1rem 3rem;
  border-radius: 2rem;
  font-size: 1.2rem;
  box-shadow: 0 4px 24px 0 #0001;
  transition: background 0.2s, box-shadow 0.2s, transform 0.1s;
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
}
.modern-save-btn:hover {
  background: linear-gradient(90deg, #16a34a 0%, #1d4ed8 100%);
  box-shadow: 0 8px 32px 0 #0002;
  transform: scale(1.04);
}
</style>
