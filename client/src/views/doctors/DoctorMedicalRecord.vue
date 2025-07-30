<template>
  <v-container class="fill-height d-flex flex-column align-center justify-center">
    <v-card max-width="700" class="pa-8">
      <h2 class="text-h4 font-weight-bold mb-6 text-primary text-center">Tạo hồ sơ bệnh án</h2>
      <v-form @submit.prevent="handleSubmit">
        <v-row>
          <v-col cols="12" sm="6">
            <v-text-field v-model="patientName" label="Họ tên bệnh nhân" required />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="patientPhone" label="Số điện thoại bệnh nhân" required />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="patientDob" label="Ngày sinh" type="date" required />
          </v-col>
          <v-col cols="12" sm="6">
            <v-select v-model="patientGender" :items="['Nam', 'Nữ', 'Khác']" label="Giới tính" required />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="patientEmail" label="Email bệnh nhân" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="patientAddress" label="Địa chỉ bệnh nhân" required />
          </v-col>
          <v-col cols="12">
            <v-textarea v-model="diagnosis" label="Chẩn đoán" required rows="2" />
          </v-col>
          <v-col cols="12">
            <v-textarea v-model="treatment" label="Phương pháp điều trị" required rows="2" />
          </v-col>
          <v-col cols="12">
            <v-textarea v-model="prescription" label="Đơn thuốc" rows="2" />
          </v-col>
          <v-col cols="12">
            <v-textarea v-model="notes" label="Ghi chú" rows="2" />
          </v-col>
        </v-row>
        <v-btn type="submit" color="primary" class="mt-4" :loading="loading">Tạo hồ sơ bệnh án</v-btn>
      </v-form>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import Swal from 'sweetalert2';
import api from '@/plugins/api';
const patientName = ref("");
const patientPhone = ref("");
const patientDob = ref("");
const patientGender = ref("");
const patientEmail = ref("");
const patientAddress = ref("");
const diagnosis = ref("");
const treatment = ref("");
const prescription = ref("");
const notes = ref("");
const loading = ref(false);

async function handleSubmit() {
  loading.value = true;
  try {
    // 1. Kiểm tra số điện thoại bệnh nhân
    const searchRes = await api.get(`/patients/search?query=${patientPhone.value}`);
    let patient = searchRes.data.find(p => p.phone === patientPhone.value);
    if (!patient) {
      // 2. Nếu chưa có, tạo mới bệnh nhân
      const createRes = await api.post('/patients', {
        fullName: patientName.value,
        phone: patientPhone.value,
        dateOfBirth: patientDob.value,
        gender: patientGender.value,
        email: patientEmail.value,
        address: patientAddress.value
      });
      patient = createRes.data;
    }
    // 3. Tạo hồ sơ bệnh án
    await api.post('/medical-records', {
      patient: patient._id,
      diagnosis: diagnosis.value,
      treatment: treatment.value,
      prescription: prescription.value,
      notes: notes.value,
      doctor: JSON.parse(sessionStorage.getItem('doctorUser'))._id
    });
    Swal.fire({ icon: 'success', title: 'Tạo hồ sơ bệnh án thành công!' });
    // Reset form
    patientName.value = '';
    patientPhone.value = '';
    patientDob.value = '';
    patientGender.value = '';
    patientEmail.value = '';
    patientAddress.value = '';
    diagnosis.value = '';
    treatment.value = '';
    prescription.value = '';
    notes.value = '';
  } catch (error) {
    Swal.fire({ icon: 'error', title: 'Lỗi', text: error?.response?.data?.message || error.message });
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.text-primary {
  color: #1976d2;
}
</style> 