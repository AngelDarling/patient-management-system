<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" app>
      <v-list>
        <v-list-item @click="logout" style="cursor:pointer;">
          <v-icon class="mr-2">mdi-logout</v-icon>
          <span>Đăng xuất</span>
        </v-list-item>
        <v-divider class="my-2" />
        <v-list-item
          v-for="item in menuItems"
          :key="item.title"
          :to="item.path"
          link
          component="RouterLink"
        >
          <v-icon class="mr-2">{{ item.icon }}</v-icon>
          <span>{{ item.title }}</span>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app color="primary" dark>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title class="app-title-right" style="margin-left:auto; text-align:right; margin-right: 20px;">Hệ thống Quản lý Phòng khám</v-toolbar-title>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';
const router = useRouter();
const drawer = ref(true);
const menuItems = [
  { title: 'Trang cá nhân', path: '/doctor/profile', icon: 'mdi-account' },
  { title: 'Đổi mật khẩu', path: '/doctor/change-password', icon: 'mdi-lock-reset' },
  { title: 'Hồ sơ bệnh án', path: '/doctor/medical-record', icon: 'mdi-file-document' },
  { title: 'Lịch sử hồ sơ bệnh án', path: '/doctor/medical-record-history', icon: 'mdi-history' }
];
function logout() {
  localStorage.removeItem('doctorUser');
  sessionStorage.removeItem('doctorUser');
  router.replace('/login').then(() => {
    Swal.fire({ icon: 'success', title: 'Đăng xuất thành công!', timer: 1200, showConfirmButton: false });
    setTimeout(() => {
      window.location.reload();
    }, 1200);
  });
}
</script>

<style scoped>
.app-title-right {
  margin-left: auto;
  text-align: right;
  margin-right: 20px;
}
</style> 