<template>
  <navBarComponent />
  <sideBarComponent />
  <router-view />
</template>

<script setup>
import navBarComponent from "@/components/dashboardComponent/navBarComponent.vue";
import sideBarComponent from "@/components/dashboardComponent/sideBarComponent.vue";
</script>

<style scoped></style>
