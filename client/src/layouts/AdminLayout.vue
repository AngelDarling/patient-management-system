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

    <v-snackbar
      v-model="showError"
      :timeout="3000"
      color="error"
    >
      {{ error }}
      <template v-slot:action="{ attrs }">
        <v-btn
          text
          v-bind="attrs"
          @click="showError = false"
        >
          Đóng
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';

const store = useStore();
const router = useRouter();
const drawer = ref(true);
const showError = ref(false);
const error = computed(() => store.getters.error);

const menuItems = [
  { title: 'Trang chủ', path: '/', icon: 'mdi-home' },
  { title: 'Bệnh nhân', path: '/patients', icon: 'mdi-account-multiple' },
  { title: 'Bác sĩ', path: '/doctors', icon: 'mdi-stethoscope' },
  { title: 'Lịch hẹn', path: '/appointments', icon: 'mdi-calendar' },
  { title: 'Hồ sơ bệnh án', path: '/medical-records', icon: 'mdi-file-document' }
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