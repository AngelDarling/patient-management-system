<template>
  <div class="patient-list">
    <v-row>
      <v-col cols="12" class="text-center mb-2">
        <h1 class="main-title">Danh sách bệnh nhân</h1>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" class="d-flex align-center justify-space-between mb-1 flex-wrap filter-bar">
        <v-select
          v-model="genderFilter"
          :items="['Tất cả', 'Nam', 'Nữ', 'Khác']"
          label="Lọc theo giới tính"
          dense
          style="max-width: 200px; margin-right: 12px;"
        />
        <v-select
          v-model="ageFilter"
          :items="ageOptions"
          label="Lọc theo độ tuổi"
          dense
          style="max-width: 200px; margin-right: 12px;"
        />
        <v-select
          v-model="sortFilter"
          :items="sortOptions"
          label="Sắp xếp theo"
          dense
          style="max-width: 200px;"
        />
        <v-btn color="primary" class="ml-auto" @click="openAddPatientDialog">
          <v-icon left>mdi-plus</v-icon>
          Thêm bệnh nhân
        </v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card class="modern-card">
          <v-card-text>
            <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              label="Tìm kiếm bệnh nhân"
              single-line
              hide-details
              clearable
              class="modern-search"
            ></v-text-field>
          </v-card-text>
          <div class="table-responsive">
            <table class="custom-patient-table modern-table elevation-2" style="width:100%">
              <thead>
                <tr class="main-header-row">
                  <th class="main-header-cell left-radius">Mã bệnh nhân</th>
                  <th class="main-header-cell">Họ và tên</th>
                  <th class="main-header-cell">Ngày sinh</th>
                  <th class="main-header-cell">Giới tính</th>
                  <th class="main-header-cell">Số điện thoại</th>
                  <th class="main-header-cell">Địa chỉ</th>
                  <th class="main-header-cell right-radius">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in paginatedPatients" :key="item._id">
                  <td>{{ item.patientId }}</td>
                  <td>{{ item.fullName }}</td>
                  <td>{{ formatDate(item.dateOfBirth) }}</td>
                  <td>{{ item.gender }}</td>
                  <td>{{ item.phone }}</td>
                  <td>{{ item.address }}</td>
                  <td>
                    <v-btn icon color="primary" @click="editPatient(item)" class="mr-1 modern-action-btn">
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn icon color="error" @click="deletePatient(item)" class="modern-action-btn">
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="pagination-bar d-flex align-center justify-center mt-1" style="gap: 8px;">
            <span>Hiển thị</span>
            <v-select
              v-model="itemsPerPage"
              :items="[5, 10, 20, 50]"
              dense
              hide-details
              style="min-width: 70px; max-width: 90px;"
            />
            <span>{{ startItem }}-{{ endItem }} / {{ sortedPatients.length.toLocaleString() }}</span>
            <v-btn icon :disabled="currentPage === 1" @click="currentPage = 1"><v-icon>mdi-page-first</v-icon></v-btn>
            <v-btn icon :disabled="currentPage === 1" @click="currentPage--"><v-icon>mdi-chevron-left</v-icon></v-btn>
            <v-btn icon :disabled="currentPage === pageCount" @click="currentPage++"><v-icon>mdi-chevron-right</v-icon></v-btn>
            <v-btn icon :disabled="currentPage === pageCount" @click="currentPage = pageCount"><v-icon>mdi-page-last</v-icon></v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Add/Edit Patient Dialog -->
    <v-dialog
      v-model="showAddDialog"
      max-width="600px"
    >
      <v-card>
        <v-card-title>
          <span class="text-h5">
            {{ readonlyDialog ? 'Xem thông tin bệnh nhân' : (editedId ? 'Sửa thông tin bệnh nhân' : 'Thêm bệnh nhân mới') }}
          </span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.fullName"
                  label="Họ và tên"
                  :readonly="readonlyDialog"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.patientId"
                  label="Mã bệnh nhân"
                  :readonly="true"
                  hint="Tự động sinh khi thêm mới"
                  persistent-hint
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  :value="editedItem.dateOfBirth"
                  @update:modelValue="val => { editedItem.dateOfBirth = val }"
                  label="Ngày sinh (dd/mm/yyyy)"
                  :readonly="readonlyDialog"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="editedItem.gender"
                  :items="['Nam', 'Nữ', 'Khác']"
                  label="Giới tính"
                  :readonly="readonlyDialog"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="editedItem.address"
                  label="Địa chỉ"
                  :readonly="readonlyDialog"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.phone"
                  label="Số điện thoại"
                  :readonly="readonlyDialog"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.email"
                  label="Email"
                  type="email"
                  :readonly="readonlyDialog"
                ></v-text-field>
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
            Đóng
          </v-btn>
          <v-btn
            v-if="!readonlyDialog"
            color="blue darken-1"
            text
            @click="savePatient"
          >
            Lưu
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog
      v-model="showDeleteDialog"
      max-width="400px"
    >
      <v-card>
        <v-card-title class="text-h5">
          Xác nhận xóa bệnh nhân
        </v-card-title>
        <v-card-text>
          Bạn có chắc chắn muốn xóa bệnh nhân này không?
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

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<style scoped>
.main-title {
  color: #1976d2;
  font-size: 2.2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  letter-spacing: 1px;
  text-shadow: 0 2px 8px rgba(33,150,243,0.08);
}
.filter-bar {
  background: #f8fafc;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  padding: 10px 16px 4px 16px;
  margin-bottom: 8px !important;
}
.modern-card {
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(33,150,243,0.08);
  padding-bottom: 8px;
}
.modern-search {
  border-radius: 8px;
  background: #f5fafd;
  margin-bottom: 0;
}
.table-responsive {
  width: 100%;
  overflow-x: auto;
}
.custom-patient-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin-bottom: 0;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(33,150,243,0.10);
  background: #fff;
}
.custom-patient-table th, .custom-patient-table td {
  border: 1px solid #e0e0e0;
  padding: 8px 0;
  text-align: center;
}
.custom-patient-table th {
  background: #e3f2fd;
  color: #1976d2;
  font-weight: bold;
  font-size: 17px;
  border: none;
}
.custom-patient-table tr:nth-child(even) {
  background: #f6fafd;
}
.custom-patient-table tr:hover {
  background: #e3f2fd;
  transition: background 0.2s;
}
.main-header-row {
  background: linear-gradient(90deg, #1e88e5, #42a5f5) !important;
  color: white !important;
}
.main-header-cell {
  padding: 14px 18px;
  text-align: center;
  font-weight: 600;
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  background: transparent !important;
  color: white !important;
  border: none;
}
.left-radius {
  border-top-left-radius: 8px !important;
  border-bottom-left-radius: 8px !important;
  overflow: hidden;
}
.right-radius {
  border-top-right-radius: 8px !important;
  border-bottom-right-radius: 8px !important;
  overflow: hidden;
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
.modern-action-btn:hover {
  background: #e3f2fd !important;
  color: #1976d2 !important;
}
.v-btn[icon][color="primary"] {
  background: #e3f2fd;
  color: #1976d2;
}
.v-btn[icon][color="error"] {
  background: #ffebee;
  color: #d32f2f;
}
.pagination-bar {
  padding: 8px 0 4px 0;
  background: #f8fafc;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(33,150,243,0.06);
  margin-top: 8px;
}
</style>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d)) return dateStr
  return d.toLocaleDateString('vi-VN')
}

function getAge(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  if (isNaN(d)) return null
  const diff = Date.now() - d.getTime()
  const age = new Date(diff).getUTCFullYear() - 1970
  return age
}

export default {
  name: 'PatientList',
  setup () {
    const store = useStore()
    const search = ref('')
    const showAddDialog = ref(false)
    const showDeleteDialog = ref(false)
    const dateMenu = ref(false)
    const editedId = ref(null)
    const editedItem = ref({
      fullName: '',
      patientId: '',
      dateOfBirth: '',
      gender: '',
      address: '',
      phone: '',
      email: ''
    })
    const patientToDelete = ref(null)
    const genderFilter = ref('Tất cả')
    const ageFilter = ref('Tất cả')
    const ageOptions = [
      'Tất cả',
      'Dưới 18',
      '18-30',
      '31-45',
      '46-60',
      'Trên 60'
    ]
    const snackbar = ref({ show: false, text: '', color: 'success' })
    const readonlyDialog = ref(false)
    const sortFilter = ref('Mã tăng dần')
    const sortOptions = [
      'Mã tăng dần',
      'Mã giảm dần',
      'Tên A-Z',
      'Tên Z-A'
    ]
    const itemsPerPage = ref(10)
    const currentPage = ref(1)

    const headers = [
      { text: 'Mã BN', value: 'patientId' },
      { text: 'Họ và tên', value: 'fullName' },
      { text: 'Ngày sinh', value: 'dateOfBirth' },
      { text: 'Giới tính', value: 'gender' },
      { text: 'Số điện thoại', value: 'phone' },
      { text: 'Địa chỉ', value: 'address' },
      { text: 'Thao tác', value: 'actions', sortable: false }
    ]

    const loading = computed(() => store.getters.isLoading)
    const patients = computed(() => store.getters.patients)

    const filteredPatients = computed(() => {
      let result = patients.value
      if (genderFilter.value && genderFilter.value !== 'Tất cả') {
        result = result.filter(p => p.gender === genderFilter.value)
      }
      if (ageFilter.value && ageFilter.value !== 'Tất cả') {
        result = result.filter(p => {
          const age = getAge(p.dateOfBirth)
          if (ageFilter.value === 'Dưới 18') return age < 18
          if (ageFilter.value === '18-30') return age >= 18 && age <= 30
          if (ageFilter.value === '31-45') return age >= 31 && age <= 45
          if (ageFilter.value === '46-60') return age >= 46 && age <= 60
          if (ageFilter.value === 'Trên 60') return age > 60
          return true
        })
      }
      if (search.value && search.value.trim() !== '') {
        const keyword = search.value.trim().toLowerCase();
        result = result.filter(p =>
          (p.fullName && p.fullName.toLowerCase().includes(keyword)) ||
          (p.patientId && p.patientId.toLowerCase().includes(keyword)) ||
          (p.phone && p.phone.toLowerCase().includes(keyword)) ||
          (p.address && p.address.toLowerCase().includes(keyword))
        );
      }
      return result
    })

    const headersWithSort = computed(() => [
      {
        text: 'Mã BN',
        value: 'patientId',
        align: 'center',
        sortable: true,
        class: 'sortable-header',
        cellClass: 'text-center',
      },
      {
        text: 'Họ và tên',
        value: 'fullName',
        align: 'center',
        sortable: true,
        class: 'sortable-header',
        cellClass: 'text-center',
      },
      { text: 'Ngày sinh', value: 'dateOfBirth', align: 'center' },
      { text: 'Giới tính', value: 'gender', align: 'center' },
      { text: 'Số điện thoại', value: 'phone', align: 'center' },
      { text: 'Địa chỉ', value: 'address', align: 'center' },
      { text: 'Thao tác', value: 'actions', sortable: false, align: 'center' }
    ])

    const sortedPatients = computed(() => {
      let arr = [...filteredPatients.value]
      if (sortFilter.value === 'Mã tăng dần') {
        arr.sort((a, b) => parseInt(a.patientId.replace('BN', '')) - parseInt(b.patientId.replace('BN', '')))
      } else if (sortFilter.value === 'Mã giảm dần') {
        arr.sort((a, b) => parseInt(b.patientId.replace('BN', '')) - parseInt(a.patientId.replace('BN', '')))
      } else if (sortFilter.value === 'Tên A-Z') {
        arr.sort((a, b) => a.fullName.localeCompare(b.fullName, 'vi', { sensitivity: 'base' }))
      } else if (sortFilter.value === 'Tên Z-A') {
        arr.sort((a, b) => b.fullName.localeCompare(a.fullName, 'vi', { sensitivity: 'base' }))
      }
      return arr
    })

    const paginatedPatients = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value
      const end = start + itemsPerPage.value
      return sortedPatients.value.slice(start, end)
    })
    const pageCount = computed(() => Math.ceil(sortedPatients.value.length / itemsPerPage.value))
    const startItem = computed(() => (sortedPatients.value.length === 0 ? 0 : (currentPage.value - 1) * itemsPerPage.value + 1))
    const endItem = computed(() => Math.min(currentPage.value * itemsPerPage.value, sortedPatients.value.length))

    onMounted(() => {
      store.dispatch('fetchPatients')
    })

    const viewPatient = (item) => {
      editedId.value = item._id
      editedItem.value = { ...item }
      showAddDialog.value = true
      readonlyDialog.value = true
    }

    const editPatient = (item) => {
      editedId.value = item._id
      // Format lại ngày sinh nếu là ISO
      let dob = item.dateOfBirth
      if (dob && typeof dob === 'string' && dob.includes('T')) {
        const d = new Date(dob)
        dob = d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear()
      }
      editedItem.value = { ...item, dateOfBirth: dob }
      showAddDialog.value = true
      readonlyDialog.value = false
    }

    const deletePatient = (item) => {
      patientToDelete.value = item
      showDeleteDialog.value = true
    }

    const closeDialog = () => {
      showAddDialog.value = false
      editedId.value = null
      readonlyDialog.value = false
      editedItem.value = {
        fullName: '',
        patientId: '',
        dateOfBirth: '',
        gender: '',
        address: '',
        phone: '',
        email: ''
      }
    }

    const savePatient = async () => {
      try {
        let data = { ...editedItem.value };
        if (!editedId.value) {
          // Nếu là thêm mới, xóa patientId để backend tự sinh
          delete data.patientId;
        }
        // Chuyển ngày sinh sang ISO nếu nhập dạng dd/mm/yyyy
        if (data.dateOfBirth && data.dateOfBirth.includes('/')) {
          const [d, m, y] = data.dateOfBirth.split('/');
          if (d && m && y) {
            data.dateOfBirth = new Date(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`).toISOString();
          }
        }
        if (editedId.value) {
          await store.dispatch('updatePatient', {
            id: editedId.value,
            data
          });
          snackbar.value = { show: true, text: 'Cập nhật thành công!', color: 'success' };
        } else {
          await store.dispatch('createPatient', data);
          snackbar.value = { show: true, text: 'Thêm mới thành công!', color: 'success' };
        }
        closeDialog();
        store.dispatch('fetchPatients');
      } catch (error) {
        snackbar.value = { show: true, text: error?.response?.data?.message || 'Có lỗi xảy ra!', color: 'error' };
        console.error('Error saving patient:', error?.response?.data || error);
      }
    }

    const confirmDelete = async () => {
      try {
        await store.dispatch('deletePatient', patientToDelete.value._id)
        showDeleteDialog.value = false
        snackbar.value = { show: true, text: 'Xóa thành công!', color: 'success' }
        store.dispatch('fetchPatients')
      } catch (error) {
        snackbar.value = { show: true, text: 'Có lỗi khi xóa!', color: 'error' }
        console.error('Error deleting patient:', error)
      }
    }

    const openAddPatientDialog = () => {
      editedId.value = null;
      readonlyDialog.value = false;
      editedItem.value = {
        fullName: '',
        patientId: '',
        dateOfBirth: '',
        gender: '',
        address: '',
        phone: '',
        email: ''
      };
      showAddDialog.value = true;
    };

    // Reset page về 1 khi filter/sort thay đổi
    watch([itemsPerPage, sortFilter, genderFilter, ageFilter, search], () => { currentPage.value = 1 })

    return {
      search,
      headers,
      loading,
      patients,
      filteredPatients,
      showAddDialog,
      showDeleteDialog,
      dateMenu,
      editedId,
      editedItem,
      editPatient,
      deletePatient,
      closeDialog,
      savePatient,
      confirmDelete,
      genderFilter,
      ageFilter,
      ageOptions,
      snackbar,
      formatDate,
      readonlyDialog,
      viewPatient,
      openAddPatientDialog,
      sortFilter,
      sortOptions,
      headersWithSort,
      sortedPatients,
      itemsPerPage,
      currentPage,
      paginatedPatients,
      pageCount,
      startItem,
      endItem
    }
  }
}
</script>
