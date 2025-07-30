<template>
  <v-container class="fill-height d-flex flex-column align-center justify-center">
    <v-img src="https://cdn-icons-png.flaticon.com/512/4320/4320337.png" max-width="80" class="mb-4" alt="logo phòng khám" />
    <h2 class="text-h4 font-weight-bold mb-2 text-primary">Đặt lịch khám bệnh</h2>
    <p class="mb-6 text-subtitle-2">Vui lòng điền đầy đủ thông tin để được phục vụ tốt nhất!</p>
    <v-card max-width="700" class="pa-8" style="width:100%">
      <v-form ref="form" v-model="valid" @submit.prevent="submitForm">
        <v-text-field v-model="formData.fullName" label="Họ tên" :error-messages="submitted && !formData.fullName ? ['Bắt buộc nhập'] : []" required></v-text-field>
        <v-text-field v-model="formData.dob" label="Ngày sinh" type="date" :error-messages="submitted && !formData.dob ? ['Bắt buộc nhập'] : []" required></v-text-field>
        <v-text-field v-model="formData.phone" label="Số điện thoại" :error-messages="submitted && !formData.phone ? ['Bắt buộc nhập'] : []" required></v-text-field>
        <v-text-field v-model="formData.address" label="Địa chỉ" :error-messages="submitted && !formData.address ? ['Bắt buộc nhập'] : []" required></v-text-field>
        <v-textarea v-model="formData.symptoms" label="Triệu chứng" :error-messages="submitted && !formData.symptoms ? ['Bắt buộc nhập'] : []" required></v-textarea>
        <v-row>
          <v-col cols="12" md="6">
            <v-select
              v-model="formData.doctorId"
              :items="filteredDoctors"
              :item-title="doctorLabel"
              :item-value="doctor => doctor._id"
              label="Chọn bác sĩ"
              :error-messages="submitted && !formData.doctorId ? ['Bắt buộc chọn bác sĩ'] : []"
              required
            ></v-select>
          </v-col>
          <v-col cols="12" md="6">
            <v-select
              v-model="formData.appointmentDate"
              :items="filteredDates"
              label="Chọn ngày khám"
              :error-messages="submitted && !formData.appointmentDate ? ['Bắt buộc chọn ngày'] : []"
              required
              :item-title="dateLabel"
              :item-value="d => d"
            ></v-select>
          </v-col>
        </v-row>
        <div v-if="formData.appointmentDate && formData.doctorId" class="mt-4">
          <div class="mb-2 font-weight-bold">Chọn khung giờ:</div>
          <v-btn-toggle
            v-model="formData.timeSlot"
            mandatory
            class="flex-wrap"
            style="flex-wrap: wrap; justify-content: center; gap: 8px;"
          >
            <v-btn
              v-for="slot in availableTimeSlots"
              :key="slot.startTime"
              :value="slot"
              :disabled="slot.disabled"
              class="ma-1"
              color="primary"
              variant="outlined"
              style="font-size: 1.2rem; min-width: 120px; min-height: 48px;"
            >
              {{ slot.startTime }} - {{ slot.endTime }}
            </v-btn>
          </v-btn-toggle>
          <div v-if="availableTimeSlots.length === 0" class="mt-2 text-error">Không còn khung giờ trống</div>
        </div>
        <v-row class="mt-4">
          <v-col cols="6">
            <v-btn type="submit" color="primary" :loading="loading" block>Đặt lịch</v-btn>
          </v-col>
          <v-col cols="6">
            <v-btn color="secondary" block @click="resetBooking">Reset</v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';

const valid = ref(false);
const loading = ref(false);
const success = ref(false);
const error = ref('');
const form = ref(null);
const submitted = ref(false);
const formData = reactive({
  fullName: '',
  dob: '',
  phone: '',
  address: '',
  symptoms: '',
  doctorId: '',
  appointmentDate: '',
  timeSlot: null
});
const doctors = ref([]);
const appointments = ref([]);

const weekdayMap = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

const today = new Date();
const nextWeek = new Date();
nextWeek.setDate(today.getDate() + 7);

onMounted(async () => {
  try {
    const res = await axios.get('/api/doctors');
    doctors.value = res.data;
  } catch (e) {
    error.value = 'Không lấy được danh sách bác sĩ';
  }
});

const doctorLabel = (doctor) =>
  doctor && doctor.fullName && doctor.specialization
    ? `${doctor.fullName} - ${doctor.specialization}`
    : '';

const dateLabel = (date) => {
  const d = new Date(date);
  return `${d.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' })}`;
};

// Lấy các ngày trong 1 tuần tới
function getNext7Days() {
  const days = [];
  const today = new Date(); // luôn lấy ngày hiện tại
  for (let i = 0; i < 7; i++) {
    const day = new Date(today);
    day.setDate(today.getDate() + i);
    days.push(day.toISOString().slice(0, 10));
  }
  return days;
}

// Lọc ngày theo bác sĩ
const filteredDates = computed(() => {
  if (!formData.doctorId) return getNext7Days(); // Cho phép chọn 7 ngày tới nếu chưa chọn bác sĩ
  const doctor = doctors.value.find(d => d._id === formData.doctorId);
  if (!doctor || !doctor.schedule) return [];
  const days = getNext7Days();
  return days.filter(date => {
    const d = new Date(date);
    const dayOfWeek = weekdayMap[d.getDay()];
    return doctor.schedule.some(s => s.dayOfWeek === dayOfWeek);
  });
});

// Lọc bác sĩ theo ngày
const filteredDoctors = computed(() => {
  if (!formData.appointmentDate) return doctors.value.filter(doc => doc.isAvailable);
  const d = new Date(formData.appointmentDate);
  const dayOfWeek = weekdayMap[d.getDay()];
  return doctors.value
    .filter(doc => doc.isAvailable)
    .filter(doc => doc.schedule && doc.schedule.some(s => s.dayOfWeek === dayOfWeek));
});

// Thêm watcher cho formData.doctorId và formData.appointmentDate
watch([
  () => formData.doctorId,
  () => formData.appointmentDate
], async ([doctorId, date]) => {
  formData.timeSlot = null;
  if (doctorId && date) {
    try {
      const res = await axios.get('/api/appointments', {
        params: {
          doctor: doctorId,
          appointmentDate: date
        }
      });
      appointments.value = res.data;
    } catch (e) {
      appointments.value = [];
    }
  } else {
    appointments.value = [];
  }
});

function splitTimeSlots(timeSlots) {
  const slots = [];
  for (const slot of timeSlots) {
    let start = slot.startTime;
    while (start < slot.endTime) {
      const [h, m] = start.split(':').map(Number);
      const endHour = h + 1;
      const end = (endHour < 10 ? '0' : '') + endHour + ':00';
      if (end > slot.endTime) break;
      slots.push({ startTime: start, endTime: end });
      start = end;
    }
  }
  return slots;
}

function toMinutes(str) {
  if (!str) return 0;
  const [h, m] = str.split(':').map(Number);
  return h * 60 + (m || 0);
}

const availableTimeSlots = computed(() => {
  if (!formData.appointmentDate || !formData.doctorId) return [];
  const doctor = doctors.value.find(d => d._id === formData.doctorId);
  if (!doctor || !doctor.schedule) return [];
  const d = new Date(formData.appointmentDate);
  const dayOfWeek = weekdayMap[d.getDay()];
  const scheduleForDay = doctor.schedule.find(s => s.dayOfWeek === dayOfWeek);
  if (!scheduleForDay || !scheduleForDay.timeSlots) return [];
  // Chia nhỏ các timeSlot lớn thành slot 1 tiếng
  const slots = splitTimeSlots(scheduleForDay.timeSlots);
  const bookedSlots = appointments.value
    .map(a => a.timeSlot && a.timeSlot.startTime && a.timeSlot.endTime
      ? { start: a.timeSlot.startTime, end: a.timeSlot.endTime }
      : null)
    .filter(Boolean);
  return slots.map(slot => {
    const slotStart = toMinutes(slot.startTime);
    const slotEnd = toMinutes(slot.endTime);
    const isOverlap = bookedSlots.some(b => {
      const bStart = toMinutes(b.start);
      const bEnd = toMinutes(b.end);
      return slotStart < bEnd && slotEnd > bStart;
    });
    return {
      ...slot,
      disabled: isOverlap
    };
  });
});

const showSuccess = (msg) => {
  Swal.fire({
    icon: 'success',
    title: msg || 'Thành công!',
    position: 'top',
    showConfirmButton: false,
    timer: 2000,
    toast: true,
    customClass: { popup: 'swal2-popup-custom' }
  });
};
const showError = (msg) => {
  Swal.fire({
    icon: 'error',
    title: msg || 'Có lỗi xảy ra!',
    position: 'top',
    showConfirmButton: false,
    timer: 3000,
    toast: true,
    customClass: { popup: 'swal2-popup-custom' }
  });
};

const submitForm = async () => {
  submitted.value = true;
  // Kiểm tra thiếu trường nào thì không gửi request
  if (
    !formData.fullName ||
    !formData.dob ||
    !formData.phone ||
    !formData.address ||
    !formData.symptoms ||
    !formData.doctorId ||
    !formData.appointmentDate
  ) {
    loading.value = false;
    return;
  }
  error.value = '';
  success.value = false;
  loading.value = true;
  try {
    await axios.post('/api/appointments', {
      ...formData,
      doctor: formData.doctorId,
      appointmentDate: formData.appointmentDate,
      timeSlot: formData.timeSlot,
      dateOfBirth: formData.dob
    });
    showSuccess('Đặt lịch thành công!');
    Object.assign(formData, { fullName: '', dob: '', phone: '', address: '', symptoms: '', doctorId: '', appointmentDate: '', timeSlot: null });
    submitted.value = false;
  } catch (e) {
    showError(e.response?.data?.message || 'Đặt lịch thất bại');
  } finally {
    loading.value = false;
  }
};

function resetBooking() {
  formData.doctorId = '';
  formData.appointmentDate = '';
  formData.timeSlot = null;
  submitted.value = false;
}
</script>

<style scoped>
.v-btn-group.v-btn-toggle.flex-wrap {
  height: auto !important;
  min-height: 48px;
}
</style> 