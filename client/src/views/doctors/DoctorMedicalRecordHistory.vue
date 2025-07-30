<template>
  <div class="medical-record-list">
    <v-row>
      <v-col cols="12" class="text-center mb-2">
        <h1 class="main-title blue-title">Lịch sử hồ sơ bệnh án của tôi</h1>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <div class="filter-bar px-4 py-3 mb-3">
          <div class="d-flex justify-center">
            <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              label="Tìm kiếm hồ sơ"
              single-line
              hide-details
              clearable
              class="modern-search search-bar"
              style="width: 100%; min-width: 300px;"
            ></v-text-field>
          </div>
        </div>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-card class="modern-card">
          <div class="table-responsive">
            <table class="custom-medical-table modern-table elevation-2" style="width:100%">
              <thead>
                <tr class="main-header-row">
                  <th class="main-header-cell left-radius">Ngày tạo</th>
                  <th class="main-header-cell">Bệnh nhân</th>
                  <th class="main-header-cell">Chẩn đoán</th>
                  <th class="main-header-cell">Điều trị</th>
                  <th class="main-header-cell">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in paginatedRecords" :key="item._id">
                  <td>{{ formatDate(item.createdAt) }}</td>
                  <td>{{ item.patient?.fullName }}</td>
                  <td>{{ item.diagnosis }}</td>
                  <td>{{ item.treatment }}</td>
                  <td>
                    <v-btn icon color="info" @click="viewRecord(item)" class="mr-1 modern-action-btn">
                      <v-icon>mdi-eye</v-icon>
                    </v-btn>
                    <v-btn icon color="primary" @click="editRecord(item)" class="mr-1 modern-action-btn">
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn icon color="error" @click="deleteRecord(item)" class="modern-action-btn">
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </td>
                </tr>
                <tr v-if="!paginatedRecords.length">
                  <td colspan="5" class="text-center">Không có dữ liệu</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="pagination-bar d-flex align-center justify-center mt-1" style="gap: 8px; border-radius: 0 0 12px 12px;">
            <span>Hiển thị</span>
            <v-select
              v-model="itemsPerPage"
              :items="[5, 10, 20, 50]"
              dense
              hide-details
              style="min-width: 70px; max-width: 90px;"
            />
            <span>{{ startItem }}-{{ endItem }} / {{ filteredRecords.length.toLocaleString() }}</span>
            <v-btn icon :disabled="currentPage === 1" @click="currentPage = 1"><v-icon>mdi-page-first</v-icon></v-btn>
            <v-btn icon :disabled="currentPage === 1" @click="currentPage--"><v-icon>mdi-chevron-left</v-icon></v-btn>
            <v-btn icon :disabled="currentPage === pageCount" @click="currentPage++"><v-icon>mdi-chevron-right</v-icon></v-btn>
            <v-btn icon :disabled="currentPage === pageCount" @click="currentPage = pageCount"><v-icon>mdi-page-last</v-icon></v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
    <!-- Dialog xác nhận xóa -->
    <v-dialog v-model="showDeleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h5">Xác nhận xóa hồ sơ</v-card-title>
        <v-card-text>Bạn có chắc chắn muốn xóa hồ sơ bệnh án này không?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="showDeleteDialog = false">Hủy</v-btn>
          <v-btn color="red darken-1" text @click="confirmDelete">Xóa</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/plugins/api';
import Swal from 'sweetalert2';
const router = useRouter();
const search = ref('');
const records = ref([]);
const showDeleteDialog = ref(false);
const recordToDelete = ref(null);
const itemsPerPage = ref(10);
const currentPage = ref(1);

const filteredRecords = computed(() => {
  if (!search.value) return records.value;
  const s = search.value.toLowerCase();
  return records.value.filter(record =>
    (record.patient?.fullName || '').toLowerCase().includes(s) ||
    (record.diagnosis || '').toLowerCase().includes(s) ||
    (record.treatment || '').toLowerCase().includes(s)
  );
});
const pageCount = computed(() => Math.ceil(filteredRecords.value.length / itemsPerPage.value) || 1);
const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredRecords.value.slice(start, start + itemsPerPage.value);
});
const startItem = computed(() => (filteredRecords.value.length === 0 ? 0 : (currentPage.value - 1) * itemsPerPage.value + 1));
const endItem = computed(() => Math.min(currentPage.value * itemsPerPage.value, filteredRecords.value.length));

function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('vi-VN');
}

function viewRecord(item) {
  router.push(`/doctor/medical-records/${item._id}`);
}
function editRecord(item) {
  router.push(`/doctor/medical-records/${item._id}`);
}
function deleteRecord(item) {
  recordToDelete.value = item;
  showDeleteDialog.value = true;
}
async function confirmDelete() {
  try {
    await api.delete(`/medical-records/${recordToDelete.value._id}`);
    records.value = records.value.filter(r => r._id !== recordToDelete.value._id);
    showDeleteDialog.value = false;
    Swal.fire({ icon: 'success', title: 'Đã xóa hồ sơ bệnh án!' });
  } catch (error) {
    Swal.fire({ icon: 'error', title: 'Lỗi', text: error?.response?.data?.message || error.message });
  }
}
onMounted(async () => {
  const doctor = JSON.parse(sessionStorage.getItem('doctorUser'));
  if (!doctor) return;
  const res = await api.get(`/medical-records?doctor=${doctor._id}`);
  records.value = res.data;
});
</script>

<style scoped>
.main-title {
  font-size: 2.2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  letter-spacing: 1px;
  text-shadow: 0 2px 8px rgba(33, 150, 243, 0.08);
}
.blue-title {
  color: #1976d2;
}
.filter-bar {
  background: #f8fafc;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.06);
  margin-bottom: 1rem;
  align-items: center;
  min-width: 0;
}
.modern-card {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05) !important;
  overflow: hidden;
}
.modern-search {
  border-radius: 8px;
  background-color: #f5f5f5;
}
.table-responsive {
  overflow-x: auto;
}
.modern-table {
  border-collapse: separate;
  border-spacing: 0;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  table-layout: fixed;
}
.main-header-row {
  background: linear-gradient(90deg, #1e88e5, #42a5f5);
  color: white;
}
.main-header-cell {
  padding: 14px 18px;
  text-align: center;
  font-weight: 600;
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}
.modern-table tbody tr {
  border-bottom: 1px solid #e0e0e0;
  transition: background-color 0.2s;
}
.modern-table tbody tr:last-child {
  border-bottom: none;
}
.modern-table tbody tr:hover {
  background-color: #f5f5f5;
}
.modern-table td {
  padding: 14px 18px;
  font-size: 0.95rem;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.left-radius {
  border-top-left-radius: 12px;
  border-bottom-left-radius: 12px;
}
.right-radius {
  border-top-right-radius: 12px;
  border-bottom-right-radius: 12px;
}
.modern-action-btn {
  border-radius: 50%;
  min-width: 30px;
  min-height: 30px;
  width: 30px;
  height: 30px;
  margin: 0 2px;
  box-shadow: 0 2px 8px rgba(33,150,243,0.10);
  transition: background 0.2s, color 0.2s;
  padding: 0;
}
.pagination-bar {
  padding: 12px 16px;
  background-color: #f8f8f8;
  border-top: 1px solid #e0e0e0;
}
.search-bar {
  margin-top: 0;
  margin-bottom: 0;
}
.custom-medical-table th, .custom-medical-table td {
  border: 1px solid #e0e0e0;
}
.custom-medical-table th {
  border: none;
}
.custom-medical-table tr:last-child td {
  border-bottom: none;
}
</style> 