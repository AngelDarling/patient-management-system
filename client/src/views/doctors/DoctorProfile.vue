<template>
  <v-container class="fill-height d-flex flex-column align-center justify-center">
    <div class="profile-row d-flex flex-row align-center justify-center mr-8">
      <div class="profile-avatar-outer d-flex flex-column align-center justify-center mr-8">
        <div class="profile-avatar-square mb-0">
          <img v-if="avatarPreview || doctor.avatar" :src="avatarPreview || getAvatarUrl(doctor.avatar)" alt="avatar" />
          <v-icon v-else size="170">mdi-account</v-icon>
        </div>
        <v-btn v-if="isEditing" small color="primary" class="mt-2" @click="triggerAvatarUpload">Chọn ảnh đại diện</v-btn>
        <input ref="avatarInput" type="file" accept="image/*" class="d-none" @change="onAvatarChange" />
      </div>
      <v-card max-width="480" class="pa-8 elevation-3 profile-card mt-0">
        <h2 class="text-h4 font-weight-bold mb-6 text-primary text-center">Trang cá nhân bác sĩ</h2>
        <v-form v-if="isEditing" @submit.prevent="saveChanges">
            <v-text-field v-model="editDoctor.fullName" label="Họ tên" required></v-text-field>
            <v-text-field v-model="editDoctor.email" label="Email" required></v-text-field>
            <v-text-field v-model="editDoctor.specialization" label="Chuyên khoa" required></v-text-field>
            <v-text-field v-model="editDoctor.phone" label="Số điện thoại" required></v-text-field>
            <v-text-field v-model="editDoctor.staffId" label="Mã nhân viên" disabled></v-text-field>
            <v-select
              v-model="editDoctor.isAvailable"
              :items="statusItems"
              label="Trạng thái"
              item-title="text"
              item-value="value"
            ></v-select>
            <div class="mb-4">
              <label class="font-weight-bold mb-2">Bằng cấp:</label>
              <div v-for="(q, idx) in qualificationsList" :key="idx" class="d-flex align-center mb-2">
                <v-text-field
                  v-model="q.degree"
                  label="Tên bằng cấp"
                  class="mr-2"
                  dense
                  hide-details
                  style="max-width: 140px"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="q.institution"
                  label="Trường / Đơn vị"
                  class="mr-2"
                  dense
                  hide-details
                  style="max-width: 140px"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="q.year"
                  label="Năm"
                  type="number"
                  class="mr-2"
                  dense
                  hide-details
                  style="max-width: 80px"
                  required
                ></v-text-field>
                <v-btn icon color="red" @click="removeQualification(idx)" v-if="qualificationsList.length > 1">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </div>
              <v-btn small color="primary" @click="addQualification">Thêm bằng cấp</v-btn>
            </div>
            <v-btn color="primary" type="submit" class="mt-4">Lưu thay đổi</v-btn>
            <v-btn color="grey" class="mt-4 ml-2" @click="cancelEdit">Hủy</v-btn>
          </v-form>
          <template v-else>
            <v-list dense>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title><b>Họ tên:</b> {{ doctor.fullName }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title><b>Email:</b> {{ doctor.email }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title><b>Chuyên khoa:</b> {{ doctor.specialization }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title><b>Số điện thoại:</b> {{ doctor.phone }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title><b>Mã nhân viên:</b> {{ doctor.staffId }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title><b>Trạng thái:</b> <span :style="{color: doctor.isAvailable ? 'green' : 'red'}">{{ doctor.isAvailable ? 'Đang làm việc' : 'Nghỉ' }}</span></v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-list-item v-if="doctor.qualifications && doctor.qualifications.length">
                <v-list-item-content>
                  <v-list-item-title><b>Bằng cấp:</b></v-list-item-title>
                  <v-table density="compact" class="mt-2 profile-degree-table">
                    <thead>
                      <tr>
                        <th>Tên bằng cấp</th>
                        <th>Trường / Đơn vị</th>
                        <th>Năm</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(q, idx) in doctor.qualifications" :key="idx">
                        <td>{{ q.degree }}</td>
                        <td>{{ q.institution }}</td>
                        <td>{{ q.year }}</td>
                      </tr>
                    </tbody>
                  </v-table>
                </v-list-item-content>
              </v-list-item>
            </v-list>
            <v-btn color="primary" class="mt-4" @click="editProfile">Chỉnh sửa</v-btn>
          </template>
      </v-card>
    </div>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';
const doctor = ref({});
const isEditing = ref(false);
const editDoctor = ref({});
const qualificationsList = ref([
  { degree: '', institution: '', year: '' }
]);
const statusItems = [
  { text: 'Đang làm việc', value: true },
  { text: 'Nghỉ', value: false }
];
const avatarInput = ref(null);
const avatarFile = ref(null);
const avatarPreview = ref('');

onMounted(() => {
  const user = sessionStorage.getItem('doctorUser');
  if (user) {
    doctor.value = JSON.parse(user);
  }
});

function editProfile() {
  editDoctor.value = { ...doctor.value };
  qualificationsList.value = (doctor.value.qualifications && doctor.value.qualifications.length)
    ? doctor.value.qualifications.map(q => ({
        degree: q.degree || '',
        institution: q.institution || '',
        year: q.year || ''
      }))
    : [{ degree: '', institution: '', year: '' }];
  avatarPreview.value = doctor.value.avatar ? getAvatarUrl(doctor.value.avatar) : '';
  avatarFile.value = null;
  isEditing.value = true;
}

function cancelEdit() {
  isEditing.value = false;
}

function addQualification() {
  qualificationsList.value.push({ degree: '', institution: '', year: '' });
}

function removeQualification(idx) {
  if (qualificationsList.value.length > 1) {
    qualificationsList.value.splice(idx, 1);
  }
}

function triggerAvatarUpload() {
  avatarInput.value.click();
}

function onAvatarChange(e) {
  const file = e.target.files[0];
  if (file) {
    avatarFile.value = file;
    const reader = new FileReader();
    reader.onload = e2 => {
      avatarPreview.value = e2.target.result;
    };
    reader.readAsDataURL(file);
  }
}

function getAvatarUrl(avatar) {
  if (!avatar) return '';
  if (avatar.startsWith('http')) return avatar;
  return avatar;
}

async function saveChanges() {
  // Cập nhật qualifications từ danh sách nhập liệu
  editDoctor.value.qualifications = qualificationsList.value.map(q => ({
    degree: q.degree,
    institution: q.institution,
    year: q.year ? Number(q.year) : undefined
  })).filter(q => q.degree && q.institution && q.year);
  // Không gửi trường password lên backend khi cập nhật profile
  if ('password' in editDoctor.value) delete editDoctor.value.password;
  try {
    // Gọi API cập nhật
    const res = await axios.put(`/api/doctors/${doctor.value._id}`, editDoctor.value);
    let updatedDoctor = res.data;
    // Nếu có avatar mới, upload file
    if (avatarFile.value) {
      const formData = new FormData();
      formData.append('avatar', avatarFile.value);
      const avatarRes = await axios.post(`/api/doctors/${doctor.value._id}/avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      updatedDoctor = avatarRes.data.doctor;
    }
    doctor.value = updatedDoctor;
    sessionStorage.setItem('doctorUser', JSON.stringify(updatedDoctor));
    isEditing.value = false;
    Swal.fire({ icon: 'success', title: 'Thành công', text: 'Cập nhật thành công!' });
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Cập nhật thất bại!' });
  }
}
</script>

<style scoped>
.text-primary {
  color: #1976d2;
}
.profile-row {
  margin-top: 60px;
  gap: 40px;
}
.profile-card {
  border-radius: 18px;
  min-width: 320px;
  max-width: 480px;
  margin-top: 0;
  position: relative;
  z-index: 1;
}
.profile-degree-table {
  border-radius: 8px;
  overflow: hidden;
  background: #fafbfc;
}
.profile-degree-table th, .profile-degree-table td {
  padding: 6px 12px;
  text-align: center;
}
.d-none {
  display: none;
}
.profile-avatar-outer {
  margin-bottom: 0;
  z-index: 2;
}
.profile-avatar-square {
  width: 220px;
  height: 220px;
  background: #f5f5f5;
  border-radius: 18px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.10);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-bottom: 0;
}
.profile-avatar-square img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0;
}
</style> 