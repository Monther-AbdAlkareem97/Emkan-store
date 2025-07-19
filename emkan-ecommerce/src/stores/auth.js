import { ref, computed, watch } from "vue";
import { defineStore } from "pinia";
import axios from "axios";

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  const isLoggedIn = ref(false);
  const loading = ref(false);
  const error = ref(null);

  async function login(phone, password) {
    loading.value = true;
    try {
      const res = await axios.post(
        "/api/auth/login",
        {
          phone,
          password,
        },
        { withCredentials: true }
      );
      user.value = res.data.user;
      isLoggedIn.value = true;
      error.value = null;
    } catch (err) {
      error.value = err.response?.data?.message || err.message;
      isLoggedIn.value = false;
    } finally {
      loading.value = false;
    }
  }

  async function signup(userData) {
    loading.value = true;
    try {
      const res = await axios.post("/api/auth/register", userData, {
        withCredentials: true,
      });
      user.value = res.data.user;
      isLoggedIn.value = true;
      error.value = null;
    } catch (err) {
      error.value = err.response?.data?.message || err.message;
      isLoggedIn.value = false;
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    try {
      await axios.post(
        "/api/auth/logout",
        {},
        {
          withCredentials: true,
        }
      );
      user.value = null;
      isLoggedIn.value = false;
    } catch (err) {
      console.error("فشل تسجيل الخروج", err.response?.data?.message);
    }
  }

  async function checkAuth() {
    loading.value = true;
    try {
      const res = await axios.get("/api/auth/me", {
        withCredentials: true,
      });
      user.value = res.data.user;
      isLoggedIn.value = true;
      error.value = null;
    } catch (err) {
      user.value = null;
      isLoggedIn.value = false;
      error.value = null; // لا تظهر رسالة خطأ للمستخدم هنا
    } finally {
      loading.value = false;
    }
  }
  const isAuthenticated = computed(
    () => isLoggedIn.value && user.value !== null
  );

  // دالة لتجديد التوكن تلقائياً
  async function refreshToken() {
    try {
      // لا تستخدم localStorage، فقط أرسل الطلب وسيتم جلب الريفريش توكن من الكوكيز
      const res = await axios.post(
        "/api/token/refresh",
        {},
        { withCredentials: true }
      );
      // إذا تم التجديد بنجاح، ضع التوكن الجديد في الهيدر فقط لجلسة axios الحالية
      if (res.data.token) {
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${res.data.token}`;
      }
      return res.data.token;
    } catch (err) {
      await logout();
      throw err;
    }
  }

  // إعداد axios interceptor لتجديد التوكن تلقائياً عند ظهور 401
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (
        error.response &&
        error.response.status === 401 &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;
        try {
          const newToken = await refreshToken();
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
          return axios(originalRequest);
        } catch (refreshErr) {
          return Promise.reject(refreshErr);
        }
      }
      return Promise.reject(error);
    }
  );

  // دالة لتجديد التوكن تلقائياً كل 14 دقيقة (840000 مللي ثانية)
  let refreshInterval = null;

  function startAutoRefresh() {
    // أوقف أي مؤقت سابق
    if (refreshInterval) clearInterval(refreshInterval);
    // كل 14 دقيقة
    refreshInterval = setInterval(async () => {
      try {
        await refreshToken();
      } catch (e) {
        // إذا فشل التجديد، لا تفعل شيء (سيتم التعامل مع الخروج تلقائياً عند الطلبات)
      }
    }, 14 * 60 * 1000);
  }

  function stopAutoRefresh() {
    if (refreshInterval) clearInterval(refreshInterval);
    refreshInterval = null;
  }

  watch(
    () => isLoggedIn.value,
    (val) => {
      if (val) {
        startAutoRefresh();
      } else {
        stopAutoRefresh();
      }
    },
    { immediate: true }
  );

  return {
    user,
    isLoggedIn,
    loading,
    error,
    login,
    signup,
    logout,
    checkAuth,
    isAuthenticated, // إرجاع isAuthenticated ليكون متاحًا في الواجهة
    refreshToken, // إرجاع الدالة إذا أردت استخدامها يدوياً
    stopAutoRefresh, // إرجاع الدالة إذا أردت استخدامها يدوياً
  };
});
