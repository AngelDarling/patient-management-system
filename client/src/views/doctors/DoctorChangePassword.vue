<template>
  <v-container class="fill-height d-flex flex-column align-center justify-center">
    <v-card class="pa-8 change-password-card">
      <h2 class="text-h4 font-weight-bold mb-6 text-primary text-center">Đổi mật khẩu</h2>
      <v-form @submit.prevent="handleChangePassword">
        <v-text-field
          v-model="oldPassword"
          label="Mật khẩu cũ"
          type="password"
          required
          class="mb-3"
        />
        <v-text-field
          v-model="newPassword"
          label="Mật khẩu mới"
          type="password"
          required
          class="mb-3"
        />
        <v-text-field
          v-model="confirmPassword"
          label="Xác nhận mật khẩu mới"
          type="password"
          required
          :error="confirmPassword && newPassword !== confirmPassword"
          :error-messages="confirmPassword && newPassword !== confirmPassword ? 'Mật khẩu xác nhận không khớp' : ''"
          class="mb-3"
        />
        <v-btn type="submit" color="primary" :disabled="!oldPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword">
          Đổi mật khẩu
        </v-btn>
      </v-form>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import Swal from 'sweetalert2';
import api from '@/plugins/api';
const oldPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
function handleChangePassword() {
  if (newPassword.value !== confirmPassword.value) {
    Swal.fire({ icon: 'error', title: 'Mật khẩu xác nhận không khớp!' });
    return;
  }
  const doctor = JSON.parse(sessionStorage.getItem('doctorUser'));
  if (!doctor || !doctor._id) {
    Swal.fire({ icon: 'error', title: 'Không xác định được tài khoản bác sĩ!' });
    return;
  }
  api.post(`/doctors/${doctor._id}/change-password`, {
    oldPassword: oldPassword.value,
    newPassword: newPassword.value
  })
    .then(() => {
      Swal.fire({ icon: 'success', title: 'Đổi mật khẩu thành công!' });
      oldPassword.value = '';
      newPassword.value = '';
      confirmPassword.value = '';
    })
    .catch(err => {
      Swal.fire({ icon: 'error', title: 'Lỗi', text: err?.response?.data?.message || err.message });
    });
}
</script>

<style scoped>
.text-primary {
  color: #1976d2;
}
.change-password-card {
  width: 600px !important;
  max-width: 100%;
}
</style> 