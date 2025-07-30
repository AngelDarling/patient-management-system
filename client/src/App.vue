<template>
  <div v-if="isReady">
    <router-view v-if="route.name === 'Login'" />
    <component v-else :is="layout">
      <router-view />
    </component>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';
import { computed, onMounted, onUnmounted } from 'vue';
import AdminLayout from '@/layouts/AdminLayout.vue';
import PublicLayout from '@/layouts/PublicLayout.vue';
import DoctorLayout from '@/layouts/DoctorLayout.vue';

const route = useRoute();
const router = useRouter();
const layout = computed(() => {
  if (route.meta.layout === 'public') return PublicLayout;
  if (route.meta.layout === 'doctor') return DoctorLayout;
  return AdminLayout;
});
const isReady = computed(() => !!route.name);

// --- Auto logout after inactivity ---
const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 phút
let inactivityTimer = null;

function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  if (route.name !== 'Login') {
    inactivityTimer = setTimeout(() => {
      sessionStorage.removeItem('doctorUser');
      router.push('/login');
    }, INACTIVITY_LIMIT);
  }
}

onMounted(() => {
  if (route.name !== 'Login') {
    window.addEventListener('mousemove', resetInactivityTimer);
    window.addEventListener('keydown', resetInactivityTimer);
    window.addEventListener('click', resetInactivityTimer);
    window.addEventListener('scroll', resetInactivityTimer);
    resetInactivityTimer();
  }
});
onUnmounted(() => {
  clearTimeout(inactivityTimer);
  window.removeEventListener('mousemove', resetInactivityTimer);
  window.removeEventListener('keydown', resetInactivityTimer);
  window.removeEventListener('click', resetInactivityTimer);
  window.removeEventListener('scroll', resetInactivityTimer);
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
