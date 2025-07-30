<template>
  <div class="medical-record-list">
    <v-row>
      <v-col cols="12" class="text-center mb-2">
        <h1 class="main-title blue-title">Danh sách hồ sơ bệnh án</h1>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <div class="filter-bar px-4 py-3 mb-3">
          <div class="d-flex align-center flex-wrap filter-group mb-2">
            <v-menu
              v-model="dateMenu"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              min-width="auto"
            >
              <template v-slot:activator="{ props }">
                <v-text-field
                  v-model="selectedDateFormatted"
                  label="Lọc theo ngày"
                  prepend-inner-icon="mdi-calendar"
                  readonly
                  dense
                  clearable
                  v-bind="props"
                  style="max-width: 200px; min-width: 180px; margin-right: 16px;"
                ></v-text-field>
              </template>
              <v-date-picker v-model="selectedDate" no-title scrollable @input="dateMenu = false"></v-date-picker>
            </v-menu>
            <v-select
              v-model="selectedDoctor"
              :items="doctors"
              item-title="fullName"
              item-value="_id"
              label="Lọc theo bác sĩ"
              dense
              clearable
              style="max-width: 200px; min-width: 180px; margin-right: 16px;"
            />
            <v-btn color="primary" class="ml-auto" style="min-width: 150px;" @click="showAddDialog = true">
              <v-icon left>mdi-plus</v-icon>
              Thêm hồ sơ
            </v-btn>
          </div>
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
                  <th class="main-header-cell">Bác sĩ</th>
                  <th class="main-header-cell">Chẩn đoán</th>
                  <th class="main-header-cell">Điều trị</th>
                  <th class="main-header-cell right-radius">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in paginatedRecords" :key="item._id">
                  <td>{{ formatDate(item.createdAt) }}</td>
                  <td>{{ getPatientName(item.patient) }}</td>
                  <td>{{ getDoctorName(item.doctor) }}</td>
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
                  <td colspan="6" class="text-center">Không có dữ liệu</td>
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

    <!-- Add/Edit Dialog -->
    <v-dialog
      v-model="showAddDialog"
      max-width="800px"
    >
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ editedId ? 'Sửa hồ sơ bệnh án' : 'Thêm hồ sơ bệnh án mới' }}</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="editedItem.patient"
                  :items="patients"
                  item-title="fullName"
                  item-value="_id"
                  label="Bệnh nhân"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="editedItem.doctor"
                  :items="doctors"
                  item-title="fullName"
                  item-value="_id"
                  label="Bác sĩ"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="editedItem.diagnosis"
                  label="Chẩn đoán"
                  required
                  rows="3"
                ></v-textarea>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="editedItem.treatment"
                  label="Phương pháp điều trị"
                  required
                  rows="3"
                ></v-textarea>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="editedItem.prescription"
                  label="Đơn thuốc"
                  rows="3"
                ></v-textarea>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="editedItem.notes"
                  label="Ghi chú"
                  rows="3"
                ></v-textarea>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            text
            @click="closeDialog"
          >
            Hủy
          </v-btn>
          <v-btn
            color="blue darken-1"
            text
            @click="saveRecord"
          >
            Lưu
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Dialog -->
    <v-dialog
      v-model="showDeleteDialog"
      max-width="400px"
    >
      <v-card>
        <v-card-title class="text-h5">
          Xác nhận xóa hồ sơ
        </v-card-title>
        <v-card-text>
          Bạn có chắc chắn muốn xóa hồ sơ bệnh án này không?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            text
            @click="showDeleteDialog = false"
          >
            Hủy
          </v-btn>
          <v-btn
            color="red darken-1"
            text
            @click="confirmDelete"
          >
            Xóa
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import moment from 'moment'
import axios from 'axios'
import Swal from 'sweetalert2'

export default {
  name: 'MedicalRecordList',
  setup () {
    const store = useStore()
    const router = useRouter()
    const search = ref('')
    const showAddDialog = ref(false)
    const showDeleteDialog = ref(false)
    const selectedDate = ref(null)
    const dateMenu = ref(false)
    const selectedDoctor = ref(null)
    const editedId = ref(null)
    const recordToDelete = ref(null)
    const itemsPerPage = ref(10)
    const currentPage = ref(1)

    const editedItem = ref({
      patient: '',
      doctor: '',
      diagnosis: '',
      treatment: '',
      prescription: '',
      notes: ''
    })

    const loading = computed(() => store.getters.isLoading)
    const medicalRecords = computed(() => store.getters.medicalRecords)
    const doctors = computed(() => store.getters.doctors)
    const patients = computed(() => store.getters.patients)

    const filteredRecords = computed(() => {
      let filtered = [...medicalRecords.value]
      if (selectedDate.value) {
        filtered = filtered.filter(record => {
          if (!record.createdAt) return false;
          return moment(record.createdAt).format('YYYY-MM-DD') === selectedDate.value;
        })
      }
      if (selectedDoctor.value) {
        filtered = filtered.filter(record => record.doctor === selectedDoctor.value)
      }
      if (search.value) {
        const s = search.value.toLowerCase()
        filtered = filtered.filter(record =>
          (getPatientName(record.patient) || '').toLowerCase().includes(s) ||
          (getDoctorName(record.doctor) || '').toLowerCase().includes(s) ||
          (record.diagnosis || '').toLowerCase().includes(s) ||
          (record.treatment || '').toLowerCase().includes(s)
        )
      }
      return filtered
    })

    const pageCount = computed(() => Math.ceil(filteredRecords.value.length / itemsPerPage.value) || 1)
    const paginatedRecords = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value
      return filteredRecords.value.slice(start, start + itemsPerPage.value)
    })
    const startItem = computed(() => (filteredRecords.value.length === 0 ? 0 : (currentPage.value - 1) * itemsPerPage.value + 1))
    const endItem = computed(() => Math.min(currentPage.value * itemsPerPage.value, filteredRecords.value.length))

    const selectedDateFormatted = computed({
      get() {
        return selectedDate.value ? moment(selectedDate.value).format('DD/MM/YYYY') : ''
      },
      set(val) {
        selectedDate.value = val ? moment(val, 'DD/MM/YYYY').format('YYYY-MM-DD') : null
      }
    })

    function getPatientName(patient) {
      if (!patient) return 'N/A';
      if (typeof patient === 'object' && patient.fullName) return patient.fullName;
      const p = patients.value.find(x => x._id === patient);
      return p ? p.fullName : 'N/A';
    }
    function getDoctorName(doctor) {
      if (!doctor) return 'N/A';
      if (typeof doctor === 'object' && doctor.fullName) return doctor.fullName;
      const d = doctors.value.find(x => x._id === doctor);
      return d ? d.fullName : 'N/A';
    }

    onMounted(async () => {
      await Promise.all([
        store.dispatch('fetchMedicalRecords'),
        store.dispatch('fetchDoctors'),
        store.dispatch('fetchPatients')
      ])
    })

    const viewRecord = (item) => {
      router.push(`/medical-records/${item._id}`)
    }

    const editRecord = (item) => {
      editedId.value = item._id
      editedItem.value = { ...item }
      showAddDialog.value = true
    }

    const deleteRecord = (item) => {
      recordToDelete.value = item
      showDeleteDialog.value = true
    }

    const closeDialog = () => {
      showAddDialog.value = false
      editedId.value = null
      editedItem.value = {
        patient: '',
        doctor: '',
        diagnosis: '',
        treatment: '',
        prescription: '',
        notes: ''
      }
    }

    const saveRecord = async () => {
      try {
        if (editedId.value) {
          await store.dispatch('updateMedicalRecord', {
            id: editedId.value,
            data: editedItem.value
          })
        } else {
          await store.dispatch('createMedicalRecord', editedItem.value)
        }
        closeDialog()
        store.dispatch('fetchMedicalRecords')
        showSuccess('Hồ sơ bệnh án đã được lưu thành công!')
      } catch (error) {
        console.error('Error saving medical record:', error)
        showError('Có lỗi xảy ra khi lưu hồ sơ bệnh án.')
      }
    }

    const confirmDelete = async () => {
      try {
        await store.dispatch('deleteMedicalRecord', recordToDelete.value._id)
        showDeleteDialog.value = false
        store.dispatch('fetchMedicalRecords')
        showSuccess('Hồ sơ bệnh án đã được xóa thành công!')
      } catch (error) {
        console.error('Error deleting medical record:', error)
        showError('Có lỗi xảy ra khi xóa hồ sơ bệnh án.')
      }
    }

    const formatDate = (date) => {
      return moment(date).format('DD/MM/YYYY')
    }

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

    return {
      search,
      loading,
      medicalRecords,
      doctors,
      patients,
      showAddDialog,
      showDeleteDialog,
      selectedDate,
      selectedDateFormatted,
      dateMenu,
      selectedDoctor,
      editedId,
      editedItem,
      filteredRecords,
      paginatedRecords,
      pageCount,
      currentPage,
      itemsPerPage,
      startItem,
      endItem,
      getPatientName,
      getDoctorName,
      viewRecord,
      editRecord,
      deleteRecord,
      closeDialog,
      saveRecord,
      confirmDelete,
      formatDate,
      showSuccess,
      showError
    }
  }
}
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
.filter-group > * {
  margin-right: 18px !important;
}
.filter-group > *:last-child {
  margin-right: 0 !important;
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

