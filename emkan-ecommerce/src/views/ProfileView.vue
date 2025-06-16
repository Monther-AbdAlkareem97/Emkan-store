<template>
  <div>
    <div class="flex justify-between">
      <div><profileSideBarComponent /></div>
      <div class="w-full md:w-4/5 flex">
        <div class="w-full max-w-3xl">
          <router-view />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import profileSideBarComponent from "@/components/profile/profileSideBarComponent.vue";
</script>

<style scoped></style>
