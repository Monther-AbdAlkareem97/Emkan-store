<template>
  <div
    class="relative w-full p-4 mb-5 rounded-lg shadow-gray-400"
    :class="{ 'cursor-grabbing': isDragging, 'cursor-grab': !isDragging }"
    @mousedown="startDrag"
    @mousemove="onDrag"
    @mouseup="endDrag"
    @mouseleave="cancelDrag"
    @touchstart="startDrag"
    @touchmove="onDrag"
    @touchend="endDrag"
  >
    <div :key="current" data-aos="fade" data-aos-duration="800">
      <img
        :src="images[current]"
        alt="Banner Image"
        class="w-full h-64 sm:h-80 md:h-96 bg-contain select-none"
      />
    </div>

    <div
      class="w-20 absolute -bottom-4 left-1/2 -translate-x-1/2 flex justify-around z-20"
    >
      <button
        v-for="(img, index) in images"
        :key="index"
        @click="goTo(index)"
        :class="[
          'w-4 h-4 rounded-full border-2 border-white shadow',
          current === index
            ? 'bg-green-600 scale-110'
            : 'bg-green-300 opacity-70',
          'transition-all duration-300',
        ]"
      ></button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import AOS from "aos";

const images = [
  "/img/unnamed.webp",
  "/img/unnamed(1).webp",
  "/img/unnamed(2).webp",
  "/img/unnamed(3).webp",
];

const current = ref(0);
let interval = null;

function startSlider() {
  interval = setInterval(() => {
    current.value = (current.value + 1) % images.length;
  }, 4000);
}

function stopSlider() {
  clearInterval(interval);
}

function goTo(index) {
  current.value = index;
  stopSlider();
  startSlider();
}

// متغيرات السحب
const isDragging = ref(false);
const startX = ref(0);
const endX = ref(0);

function startDrag(event) {
  isDragging.value = true;
  startX.value = event.type.includes("mouse")
    ? event.clientX
    : event.touches[0].clientX;

  // منع السلوك الافتراضي للماوس
  event.preventDefault();
}

function onDrag(event) {
  if (!isDragging.value) return;
  endX.value = event.type.includes("mouse")
    ? event.clientX
    : event.touches[0].clientX;

  // منع السلوك الافتراضي للماوس
  event.preventDefault();
}

function endDrag() {
  if (!isDragging.value) return;

  const distance = endX.value - startX.value;

  if (distance > 50) {
    current.value = (current.value - 1 + images.length) % images.length;
    stopSlider();
    startSlider();
  } else if (distance < -50) {
    current.value = (current.value + 1) % images.length;
    stopSlider();
    startSlider();
  }

  isDragging.value = false;
  startX.value = 0;
  endX.value = 0;
}

function cancelDrag() {
  isDragging.value = false;
}

// فقط نحدث AOS لما تتغير الصورة
watch(current, () => {
  AOS.refresh();
});

onMounted(() => {
  startSlider();
});

onUnmounted(stopSlider);
</script>

<style scoped>
/* شكل المؤشر عند السحب */
.cursor-grab {
  cursor: grab;
}
.cursor-grabbing {
  cursor: grabbing;
}
/* منع تحديد النص أثناء السحب */
.select-none {
  user-select: none;
}
</style>
