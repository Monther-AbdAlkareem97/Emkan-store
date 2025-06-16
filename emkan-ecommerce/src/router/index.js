import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const routes = [
  {
    path: "/dashboard",
    name: "dashboard",
    component: () => import("@/views/dashboardView.vue"),
    children: [
      {
        path: "",
        name: "dashboard-home",
        component: () =>
          import(
            "@/components/dashboardComponent/dashboardContentComponent.vue"
          ),
      },
      {
        path: "orders",
        name: "orders",
        component: () => import("@/views/sideBarPages/ordersView.vue"),
      },
      {
        path: "products",
        name: "products",
        component: () => import("@/views/sideBarPages/productsView.vue"),
      },

      {
        path: "reports",
        name: "reports",
        component: () => import("@/views/sideBarPages/reportsView.vue"),
      },
      {
        path: "settings",
        name: "settings",
        component: () => import("@/views/sideBarPages/settingsView.vue"),
      },
      {
        path: "offers",
        name: "offers",
        component: () => import("@/views/sideBarPages/offersView.vue"),
      },
    ],
  },
  {
    path: "/",
    name: "home",
    component: () => import("@/views/HomeView.vue"),
  },
  {
    path: "/cart",
    name: "cart",
    component: () => import("@/views/CartPage.vue"),
  },
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/LoginView.vue"),
  },
  {
    path: "/signup",
    name: "signup",
    component: () => import("@/views/SignUpView.vue"),
  },
  {
    path: "/profile",
    name: "profile",
    component: () => import("@/views/ProfileView.vue"),
    children: [
      {
        path: "",
        name: "profile-main",
        component: () => import("@/components/profile/Profile.vue"),
      },
      {
        path: "orders",
        name: "profile-orders",
        component: () => import("@/components/profile/Orders.vue"),
      },
      {
        path: "settings",
        name: "profile-settings",
        component: () => import("@/components/profile/Settings.vue"),
      },
    ],
  },
  {
    path: "/checkout",
    name: "checkout",
    component: () => import("@/views/CheckoutPage.vue"),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

// حماية صفحات البروفايل (وأي صفحة تتطلب تسجيل دخول)
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const protectedPaths = ["/profile", "/dashboard"];
  const isProtected = protectedPaths.some((path) => to.path.startsWith(path));

  if (isProtected) {
    try {
      await authStore.checkAuth();
      // إذا لم يكن المستخدم مسجلاً (زائر)
      if (!authStore.user || !authStore.isAuthenticated) {
        return next({ name: "login", query: { redirect: to.fullPath } });
      }
      // حماية لوحة التحكم: فقط المدير يمكنه الدخول
      if (to.path.startsWith("/dashboard")) {
        if (authStore.user.role !== "admin") {
          return next({ name: "login", query: { redirect: to.fullPath } });
        } else {
          return next();
        }
      }
      // حماية البروفايل: أي مستخدم مسجل يمكنه الدخول
      if (to.path.startsWith("/profile")) {
        return next();
      }
    } catch {
      return next({ name: "login", query: { redirect: to.fullPath } });
    }
  } else {
    return next();
  }
});

export default router;
