<template>
  <div class="doctor-list">
    <v-row>
      <v-col cols="12" class="text-center mb-2">
        <h1 class="main-title">Danh sách bác sĩ</h1>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" class="d-flex align-center justify-space-between mb-1 flex-wrap filter-bar">
        <v-select
          v-model="specializationFilter"
          :items="specializationOptions"
          label="Lọc theo chuyên khoa"
          dense
          style="max-width: 200px; margin-right: 12px;"
        />
        <v-select
          v-model="statusFilter"
          :items="statusOptions"
          label="Lọc theo trạng thái"
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
        <v-btn color="primary" class="ml-auto" @click="openAddDoctorDialog">
          <v-icon left>mdi-plus</v-icon>
          Thêm bác sĩ
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
              label="Tìm kiếm bác sĩ"
              single-line
              hide-details
              clearable
              class="modern-search"
            ></v-text-field>
          </v-card-text>
          <div class="table-responsive">
            <table class="custom-doctor-table modern-table elevation-2" style="width:100%">
              <thead>
                <tr class="main-header-row">
                  <th class="main-header-cell left-radius">Mã NV</th>
                  <th class="main-header-cell">Họ và tên</th>
                  <th class="main-header-cell">Chuyên khoa</th>
                  <th class="main-header-cell">Số điện thoại</th>
                  <th class="main-header-cell">Email</th>
                  <th class="main-header-cell">Trạng thái</th>
                  <th class="main-header-cell right-radius">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in paginatedDoctors" :key="item._id">
                  <td>{{ item.staffId }}</td>
                  <td>{{ item.fullName }}</td>
                  <td>{{ item.specialization }}</td>
                  <td>{{ item.phone }}</td>
                  <td>{{ item.email }}</td>
                  <td>
                    <v-chip :color="item.isAvailable ? 'green' : 'red'" dark>
                      {{ item.isAvailable ? 'Sẵn sàng' : 'Không' }}
                    </v-chip>
                  </td>
                  <td>
                    <v-btn icon color="info" @click="viewSchedule(item)" class="mr-1 modern-action-btn">
                      <v-icon>mdi-calendar-clock</v-icon>
                    </v-btn>
                    <v-btn icon color="primary" @click="editDoctor(item)" class="mr-1 modern-action-btn">
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn icon color="error" @click="deleteDoctor(item)" class="modern-action-btn">
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
            <span>{{ startItem }}-{{ endItem }} / {{ sortedDoctors.length.toLocaleString() }}</span>
            <v-btn icon :disabled="currentPage === 1" @click="currentPage = 1"><v-icon>mdi-page-first</v-icon></v-btn>
            <v-btn icon :disabled="currentPage === 1" @click="currentPage--"><v-icon>mdi-chevron-left</v-icon></v-btn>
            <v-btn icon :disabled="currentPage === pageCount" @click="currentPage++"><v-icon>mdi-chevron-right</v-icon></v-btn>
            <v-btn icon :disabled="currentPage === pageCount" @click="currentPage = pageCount"><v-icon>mdi-page-last</v-icon></v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
    <!-- Add/Edit Doctor Dialog -->
    <v-dialog
      v-model="showAddDialog"
      max-width="600px"
    >
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ editedId ? 'Sửa thông tin bác sĩ' : 'Thêm bác sĩ mới' }}</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.staffId"
                  label="Mã nhân viên"
                  :readonly="true"
                  hint="Tự động sinh khi thêm mới"
                  persistent-hint
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.fullName"
                  label="Họ và tên"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.specialization"
                  label="Chuyên khoa"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.phone"
                  label="Số điện thoại"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.email"
                  label="Email"
                  type="email"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" v-if="!editedId">
                <v-text-field
                  v-model="editedItem.password"
                  label="Mật khẩu"
                  :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  @click:append="showPassword = !showPassword"
                  :type="showPassword ? 'text' : 'password'"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" v-if="editedId">
                <v-btn color="primary" @click="showResetPasswordDialog = true">Đặt lại mật khẩu</v-btn>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <label class="font-weight-bold mb-2">Bằng cấp:</label>
                <div v-for="(q, idx) in editedItem.qualifications" :key="idx" class="d-flex align-center mb-2">
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
                  <v-btn icon color="red" @click="removeQualification(idx)" v-if="editedItem.qualifications.length > 1">
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </div>
                <v-btn small color="primary" @click="addQualification">Thêm bằng cấp</v-btn>
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
            @click="saveDoctor"
          >
            Lưu
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Schedule Dialog -->
    <v-dialog
      v-model="showScheduleDialog"
      max-width="800px"
    >
      <v-card>
        <v-card-title>
          <span class="text-h5">Lịch làm việc - {{ selectedDoctor?.fullName }}</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row
              v-for="(day, index) in editedSchedule"
              :key="index"
              align="center"
            >
              <v-col cols="12" sm="3">
                <v-select
                  v-model="day.dayOfWeek"
                  :items="daysOfWeek"
                  label="Ngày"
                  required
                ></v-select>
              </v-col>
              <v-col cols="6" sm="4">
                <v-text-field
                  v-model="day.timeSlots[0].startTime"
                  label="Giờ bắt đầu"
                  placeholder="HH:mm"
                  type="time"
                ></v-text-field>
              </v-col>
              <v-col cols="6" sm="4">
                <v-text-field
                  v-model="day.timeSlots[0].endTime"
                  label="Giờ kết thúc"
                  placeholder="HH:mm"
                  type="time"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="1" class="d-flex align-center justify-center">
                <v-btn
                  icon
                  size="small"
                  color="error"
                  @click="removeScheduleDay(index)"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-btn
                  color="primary"
                  @click="addScheduleDay"
                >
                  Thêm lịch
                </v-btn>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            text
            @click="closeScheduleDialog"
          >
            Hủy
          </v-btn>
          <v-btn
            color="blue darken-1"
            text
            @click="saveSchedule"
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
          Xác nhận xóa bác sĩ
        </v-card-title>
        <v-card-text>
          Bạn có chắc chắn muốn xóa bác sĩ này không?
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
    <v-dialog v-model="showResetPasswordDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h5">Đặt lại mật khẩu</v-card-title>
        <v-card-text>
          <v-text-field v-model="resetPassword" label="Mật khẩu mới" :type="showResetPassword ? 'text' : 'password'" :append-icon="showResetPassword ? 'mdi-eye' : 'mdi-eye-off'" @click:append="showResetPassword = !showResetPassword" required />
          <v-text-field v-model="resetPasswordConfirm" label="Nhập lại mật khẩu" :type="showResetPassword ? 'text' : 'password'" :append-icon="showResetPassword ? 'mdi-eye' : 'mdi-eye-off'" @click:append="showResetPassword = !showResetPassword" required />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showResetPasswordDialog = false">Hủy</v-btn>
          <v-btn color="primary" text @click="handleResetPassword">Xác nhận</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
.custom-doctor-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin-bottom: 0;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(33,150,243,0.10);
  background: #fff;
}
.custom-doctor-table th, .custom-doctor-table td {
  border: 1px solid #e0e0e0;
  padding: 8px 0;
  text-align: center;
}
.custom-doctor-table th {
  background: #e3f2fd;
  color: #1976d2;
  font-weight: bold;
  font-size: 17px;
  border: none;
}
.custom-doctor-table tr:nth-child(even) {
  background: #f6fafd;
}
.custom-doctor-table tr:hover {
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

export default {
  name: 'DoctorList',
  setup () {
    const store = useStore()
    const search = ref('')
    const showAddDialog = ref(false)
    const showDeleteDialog = ref(false)
    const showScheduleDialog = ref(false)
    const editedId = ref(null)
    const selectedDoctor = ref(null)
    const showPassword = ref(false);
    const editedItem = ref({
      staffId: '',
      fullName: '',
      specialization: '',
      phone: '',
      email: '',
      password: '', // thêm trường password
      isAvailable: true,
      qualifications: [
        { degree: '', institution: '', year: '' }
      ]
    })
    const editedSchedule = ref([])
    const doctorToDelete = ref(null)
    const specializationFilter = ref('Tất cả')
    const statusFilter = ref('Tất cả')
    const sortFilter = ref('Mã tăng dần')
    const itemsPerPage = ref(10)
    const currentPage = ref(1)
    const snackbar = ref({ show: false, text: '', color: 'success' })
    const specializationOptions = computed(() => {
      const specs = store.getters.doctors.map(d => d.specialization).filter(Boolean)
      return ['Tất cả', ...Array.from(new Set(specs))]
    })
    const statusOptions = ['Tất cả', 'Sẵn sàng', 'Không']
    const sortOptions = [
      'Mã tăng dần',
      'Mã giảm dần',
      'Tên A-Z',
      'Tên Z-A'
    ]
    const loading = computed(() => store.getters.isLoading)
    const doctors = computed(() => store.getters.doctors)
    const filteredDoctors = computed(() => {
      let result = doctors.value
      if (specializationFilter.value && specializationFilter.value !== 'Tất cả') {
        result = result.filter(d => d.specialization === specializationFilter.value)
      }
      if (statusFilter.value && statusFilter.value !== 'Tất cả') {
        result = result.filter(d => (statusFilter.value === 'Sẵn sàng' ? d.isAvailable : !d.isAvailable))
      }
      if (search.value && search.value.trim() !== '') {
        const keyword = search.value.trim().toLowerCase();
        result = result.filter(d =>
          (d.fullName && d.fullName.toLowerCase().includes(keyword)) ||
          (d.staffId && d.staffId.toLowerCase().includes(keyword)) ||
          (d.phone && d.phone.toLowerCase().includes(keyword)) ||
          (d.email && d.email.toLowerCase().includes(keyword))
        );
      }
      return result
    })
    const sortedDoctors = computed(() => {
      let arr = [...filteredDoctors.value]
      if (sortFilter.value === 'Mã tăng dần') {
        arr.sort((a, b) => a.staffId.localeCompare(b.staffId, 'vi', { numeric: true }))
      } else if (sortFilter.value === 'Mã giảm dần') {
        arr.sort((a, b) => b.staffId.localeCompare(a.staffId, 'vi', { numeric: true }))
      } else if (sortFilter.value === 'Tên A-Z') {
        arr.sort((a, b) => a.fullName.localeCompare(b.fullName, 'vi', { sensitivity: 'base' }))
      } else if (sortFilter.value === 'Tên Z-A') {
        arr.sort((a, b) => b.fullName.localeCompare(a.fullName, 'vi', { sensitivity: 'base' }))
      }
      return arr
    })
    const paginatedDoctors = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value
      const end = start + itemsPerPage.value
      return sortedDoctors.value.slice(start, end)
    })
    const pageCount = computed(() => Math.ceil(sortedDoctors.value.length / itemsPerPage.value))
    const startItem = computed(() => (sortedDoctors.value.length === 0 ? 0 : (currentPage.value - 1) * itemsPerPage.value + 1))
    const endItem = computed(() => Math.min(currentPage.value * itemsPerPage.value, sortedDoctors.value.length))
    const daysOfWeek = [
      'Thứ 2',
      'Thứ 3',
      'Thứ 4',
      'Thứ 5',
      'Thứ 6',
      'Thứ 7',
      'Chủ nhật'
    ]
    onMounted(() => {
      store.dispatch('fetchDoctors')
    })
    const editDoctor = (item) => {
      editedId.value = item._id
      // Không lấy password từ item
      const { password, ...rest } = item;
      editedItem.value = {
        ...rest,
        qualifications: (item.qualifications && item.qualifications.length)
          ? item.qualifications.map(q => ({
              degree: q.degree || '',
              institution: q.institution || '',
              year: q.year || ''
            }))
          : [{ degree: '', institution: '', year: '' }]
      }
      showAddDialog.value = true
    }
    const deleteDoctor = (item) => {
      doctorToDelete.value = item
      showDeleteDialog.value = true
    }
    const viewSchedule = async (item) => {
      selectedDoctor.value = item
      editedSchedule.value = item.schedule || []
      showScheduleDialog.value = true
    }
    const closeDialog = () => {
      showAddDialog.value = false
      editedId.value = null
      editedItem.value = {
        staffId: '',
        fullName: '',
        specialization: '',
        phone: '',
        email: '',
        password: '', // reset password
        isAvailable: true,
        qualifications: [{ degree: '', institution: '', year: '' }]
      }
    }
    const closeScheduleDialog = () => {
      showScheduleDialog.value = false
      selectedDoctor.value = null
      editedSchedule.value = []
    }
    const addScheduleDay = () => {
      editedSchedule.value.push({
        dayOfWeek: 'Thứ 2',
        timeSlots: [{ startTime: '', endTime: '' }],
      })
    }
    const removeScheduleDay = (index) => {
      editedSchedule.value.splice(index, 1)
    }
    const addQualification = () => {
      editedItem.value.qualifications.push({ degree: '', institution: '', year: '' });
    };
    const removeQualification = (idx) => {
      if (editedItem.value.qualifications.length > 1) {
        editedItem.value.qualifications.splice(idx, 1);
      }
    };
    const saveDoctor = async () => {
      try {
        // Lọc qualifications hợp lệ
        editedItem.value.qualifications = editedItem.value.qualifications
          .map(q => ({ degree: q.degree, institution: q.institution, year: q.year ? Number(q.year) : undefined }))
          .filter(q => q.degree && q.institution && q.year);
        const payload = { ...editedItem.value };
        // Luôn xóa password nếu không đổi mật khẩu
        delete payload.password;
        if (editedId.value) {
          await store.dispatch('updateDoctor', {
            id: editedId.value,
            data: payload
          })
          snackbar.value = { show: true, text: 'Cập nhật thành công!', color: 'success' }
        } else {
          await store.dispatch('createDoctor', payload)
          snackbar.value = { show: true, text: 'Thêm mới thành công!', color: 'success' }
        }
        closeDialog()
        store.dispatch('fetchDoctors')
      } catch (error) {
        snackbar.value = { show: true, text: 'Có lỗi xảy ra!', color: 'error' }
        console.error('Error saving doctor:', error)
      }
    }
    const saveSchedule = async () => {
      for (const day of editedSchedule.value) {
        const start = day.timeSlots[0].startTime;
        const end = day.timeSlots[0].endTime;
        if (!start || !end) {
          snackbar.value = { show: true, text: 'Vui lòng nhập đủ giờ bắt đầu và kết thúc.', color: 'error' };
          return;
        }
        if (start >= end) {
          snackbar.value = { show: true, text: `Giờ kết thúc phải sau giờ bắt đầu.`, color: 'error' };
          return;
        }
      }
      try {
        await store.dispatch('updateDoctorSchedule', {
          id: selectedDoctor.value._id,
          schedule: editedSchedule.value
        })
        closeScheduleDialog()
        store.dispatch('fetchDoctors')
        snackbar.value = { show: true, text: 'Cập nhật lịch thành công!', color: 'success' }
      } catch (error) {
        snackbar.value = { show: true, text: 'Có lỗi khi lưu lịch!', color: 'error' }
        console.error('Error saving schedule:', error)
      }
    }
    const confirmDelete = async () => {
      try {
        await store.dispatch('deleteDoctor', doctorToDelete.value._id)
        showDeleteDialog.value = false
        snackbar.value = { show: true, text: 'Xoá thành công!', color: 'success' }
        store.dispatch('fetchDoctors')
      } catch (error) {
        snackbar.value = { show: true, text: 'Có lỗi khi xoá!', color: 'error' }
        console.error('Error deleting doctor:', error)
      }
    }
    const openAddDoctorDialog = () => {
      editedId.value = null;
      editedItem.value = {
        staffId: '',
        fullName: '',
        specialization: '',
        phone: '',
        email: '',
        password: '', // reset password
        isAvailable: true,
        qualifications: [{ degree: '', institution: '', year: '' }]
      };
      showAddDialog.value = true;
    };
    watch([itemsPerPage, sortFilter, specializationFilter, statusFilter, search], () => { currentPage.value = 1 })
    const showResetPasswordDialog = ref(false);
    const showResetPassword = ref(false);
    const resetPassword = ref('');
    const resetPasswordConfirm = ref('');
    const handleResetPassword = async () => {
      if (!resetPassword.value || !resetPasswordConfirm.value) {
        snackbar.value = { show: true, text: 'Vui lòng nhập đầy đủ mật khẩu.', color: 'error' };
        return;
      }
      if (resetPassword.value !== resetPasswordConfirm.value) {
        snackbar.value = { show: true, text: 'Mật khẩu nhập lại không khớp.', color: 'error' };
        return;
      }
      try {
        await store.dispatch('resetDoctorPassword', { id: editedId.value, password: resetPassword.value });
        snackbar.value = { show: true, text: 'Đặt lại mật khẩu thành công!', color: 'success' };
        showResetPasswordDialog.value = false;
        resetPassword.value = '';
        resetPasswordConfirm.value = '';
      } catch (error) {
        snackbar.value = { show: true, text: 'Có lỗi khi đặt lại mật khẩu!', color: 'error' };
      }
    };
    return {
      search,
      loading,
      showAddDialog,
      showDeleteDialog,
      showScheduleDialog,
      editedId,
      editedItem,
      selectedDoctor,
      editedSchedule,
      specializationFilter,
      statusFilter,
      sortFilter,
      specializationOptions,
      statusOptions,
      sortOptions,
      itemsPerPage,
      currentPage,
      paginatedDoctors,
      pageCount,
      startItem,
      endItem,
      snackbar,
      doctors,
      filteredDoctors,
      sortedDoctors,
      editDoctor,
      deleteDoctor,
      viewSchedule,
      closeDialog,
      closeScheduleDialog,
      addScheduleDay,
      removeScheduleDay,
      saveDoctor,
      saveSchedule,
      confirmDelete,
      openAddDoctorDialog,
      daysOfWeek,
      addQualification,
      removeQualification,
      showPassword,
      showResetPasswordDialog,
      showResetPassword,
      resetPassword,
      resetPasswordConfirm,
      handleResetPassword
    }
  }
}
</script>
