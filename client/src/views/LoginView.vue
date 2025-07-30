<template>
  <v-container class="login-bg fill-height d-flex flex-column align-center justify-center" style="min-height: 100vh; position: relative; overflow: hidden;">
    <!-- Đồ họa trang trí -->
    <div class="circle deco1"></div>
    <div class="circle deco2"></div>
    <v-icon class="deco-icon deco3" size="90" color="primary">mdi-hospital-building</v-icon>
    <v-icon class="deco-icon deco4" size="70" color="success">mdi-stethoscope</v-icon>
    <v-icon class="deco-icon deco5" size="60" color="deep-purple">mdi-heart-pulse</v-icon>
    <!-- Tiêu đề hệ thống -->
    <h1 class="main-title mb-10">Hệ thống Quản lý Phòng khám</h1>
    <v-card max-width="650" class="pa-14 login-card">
      <h2 class="text-h3 font-weight-bold mb-8 text-center">Đăng nhập bác sĩ</h2>
      <v-form @submit.prevent="handleLogin">
        <v-text-field v-model="email" label="Email" type="email" required class="mb-6" density="comfortable" style="font-size: 1.5rem; height: 70px;"></v-text-field>
        <v-text-field v-model="password" label="Mật khẩu" type="password" required class="mb-8" density="comfortable" style="font-size: 1.5rem; height: 70px;"></v-text-field>
        <v-btn type="submit" color="primary" block :loading="loading" size="x-large" style="font-size: 1.4rem; height: 64px; letter-spacing: 1px;">ĐĂNG NHẬP</v-btn>
      </v-form>
      <v-alert v-if="error" type="error" class="mt-8" style="font-size: 1.3rem;">{{ error }}</v-alert>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import Swal from 'sweetalert2';

const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);
const router = useRouter();

const handleLogin = async () => {
  error.value = '';
  loading.value = true;
  try {
    const res = await axios.post('/api/doctors/login', { email: email.value, password: password.value });
    const user = res.data;
    sessionStorage.setItem('doctorUser', JSON.stringify(user));
    if (user.isAdmin) {
      router.push('/admin').then(() => {
        Swal.fire({ icon: 'success', title: 'Đăng nhập thành công!', timer: 1200, showConfirmButton: false });
      });
    } else {
      router.push('/doctor/profile').then(() => {
        Swal.fire({ icon: 'success', title: 'Đăng nhập thành công!', timer: 1200, showConfirmButton: false });
      });
    }
  } catch (e) {
    error.value = e.response?.data?.message || 'Đăng nhập thất bại';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-bg {
  background: linear-gradient(135deg, #e3f0ff 0%, #f8e8ff 100%);
  position: relative;
}
.main-title {
  font-size: 2.7rem;
  font-weight: bold;
  color: #1976d2;
  letter-spacing: 1px;
  text-shadow: 0 4px 24px rgba(33, 150, 243, 0.10);
  z-index: 2;
  text-align: center;
}
.login-card {
  box-shadow: 0 12px 48px rgba(60,60,60,0.22);
  border-radius: 28px;
  z-index: 2;
}
.circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.18;
  z-index: 1;
}
.deco1 {
  width: 340px;
  height: 340px;
  background: #1976d2;
  top: -80px;
  left: -120px;
}
.deco2 {
  width: 220px;
  height: 220px;
  background: #8e24aa;
  bottom: -60px;
  right: -80px;
}
.deco-icon {
  position: absolute;
  opacity: 0.13;
  z-index: 1;
}
.deco3 {
  top: 60px;
  left: 60px;
}
.deco4 {
  bottom: 80px;
  right: 120px;
}
.deco5 {
  top: 180px;
  right: 80px;
}
</style> 