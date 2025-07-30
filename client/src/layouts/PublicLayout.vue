<template>
  <v-app>
    <v-app-bar color="#1976d2" flat dark>
      <v-img src="https://cdn-icons-png.flaticon.com/512/4320/4320337.png" max-width="40" class="mr-2" alt="logo phòng khám" />
      <v-toolbar-title class="text-white font-weight-bold">Phòng khám Đa khoa ABC</v-toolbar-title>
      <v-spacer />
      <v-btn text to="/homepage" class="text-white">Trang chủ</v-btn>
      <v-btn text to="/gioi-thieu" class="text-white">Giới thiệu</v-btn>
      <v-btn text to="/dat-lich" class="text-white">Đặt lịch</v-btn>
    </v-app-bar>
    <v-main>
      <slot />
    </v-main>
  </v-app>
</template>

<script setup>
// Không cần logic gì đặc biệt cho layout public
</script> 