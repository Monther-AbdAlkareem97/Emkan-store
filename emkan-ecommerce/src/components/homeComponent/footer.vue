<template>
  <footer class="bg-gray-100 rounded-t-xl footer-shadow py-10 mt-28">
    <div class="px-4 py-8 grid place-items-center">
      <div
        class="grid grid-cols-1 md:grid-cols-3 gap-4 text-center md:text-right w-full max-w-6xl"
      >
        <!-- الشعار -->
        <div
          class="flex flex-col items-center md:items-start gap-3 max-w-[400px] w-full mx-auto"
        >
          <div class="flex items-center gap-2">
            <img
              src="/profile-1.jpg"
              alt="الشعار"
              class="h-24 w-24 rounded-full"
            />
            <span class="font-bold text-lg">إمكان للتجارة الإلكترونية</span>
          </div>
        </div>

        <!-- روابط التنقل -->
        <nav class="max-w-[400px] w-full mx-auto">
          <h3 class="font-semibold mb-2">روابط سريعة</h3>
          <ul class="flex flex-col gap-2">
            <li><a href="#" class="footer-link">الرئيسية</a></li>
            <li><a href="#" class="footer-link">المتجر</a></li>
            <li>
              <a
                href="https://emkan-smart-buildings.netlify.app/"
                class="footer-link"
                >من نحن</a
              >
            </li>
          </ul>
        </nav>

        <!-- تواصل معنا -->
        <div
          class="flex flex-col items-center md:items-start gap-1 max-w-[400px] w-full mx-auto"
        >
          <h3 class="font-semibold mb-2">تواصل معنا:</h3>
          <span class="footer-text footer-link">
            <font-awesome-icon icon="phone" class="ml-1" />
            <a class="cursor-pointer">0555555555</a>
          </span>
          <span class="footer-text footer-link">
            <font-awesome-icon icon="envelope" class="ml-1" />
            <a href="mailto:info@emkan.com" class="">info@emkan.com</a>
          </span>
          <span class="footer-text">
            <font-awesome-icon
              icon="map-marker-alt"
              class="text-blue-700 ml-1"
            />
            ليبيا , البيضاء
          </span>
        </div>
      </div>
    </div>

    <!-- روابط السوشيال -->
    <div class="flex justify-center gap-4 mt-6">
      <a
        href="#"
        aria-label="واتساب"
        class="footer-link"
        style="color: #25d366"
      >
        <font-awesome-icon :icon="['fab', 'whatsapp']" class="text-2xl" />
      </a>
      <a
        href="#"
        aria-label="فيسبوك"
        class="footer-link"
        style="color: #1877f3"
      >
        <font-awesome-icon :icon="['fab', 'facebook']" class="text-2xl" />
      </a>
      <a href="#" aria-label="تيك توك" class="footer-link" style="color: #000">
        <font-awesome-icon :icon="['fab', 'tiktok']" class="text-2xl" />
      </a>
    </div>

    <!-- حقوق -->
    <div class="text-center footer-text text-sm mt-6">
      إمكان للتجارة الإلكترونية. جميع الحقوق محفوظة © 2025
    </div>
  </footer>
</template>

<style scoped>
.footer-shadow {
  box-shadow: 0 -10px 15px -3px rgba(107, 114, 128);
}
.footer-link {
  color: #2563eb; /* blue-600 */
  transition: color 0.2s;
}
.footer-link:hover {
  color: #22c55e; /* green-500 */
}
.footer-text {
  color: #2563eb; /* blue-600 */
}
</style>
