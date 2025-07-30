<template>
  <div class="appointment-list">
    <v-row>
      <v-col cols="12" class="text-center mb-2">
        <h1 class="main-title">Danh sách lịch hẹn</h1>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" class="d-flex align-center justify-space-between mb-1 flex-wrap filter-bar">
        <v-menu ref="dateMenu" v-model="dateMenu" :close-on-content-click="false" transition="scale-transition" offset-y
          min-width="auto">
          <template v-slot:activator="{ props }">
            <v-text-field v-model="selectedDate" label="Lọc theo ngày" prepend-inner-icon="mdi-calendar" readonly dense
              v-bind="props" clearable style="max-width: 200px; margin-right: 12px;"></v-text-field>
          </template>
          <v-date-picker v-model="selectedDate" no-title scrollable @input="dateMenu = false"></v-date-picker>
        </v-menu>
        <v-select
          v-model="selectedDoctor"
          :items="doctorOptions"
          item-title="text"
          item-value="value"
          label="Lọc theo bác sĩ"
          dense
          clearable
          style="max-width: 250px; margin-right: 12px;"
        ></v-select>
        <v-select v-model="selectedStatus" :items="statusOptions" label="Lọc theo trạng thái" dense clearable
          style="max-width: 200px;" />
        <v-btn color="primary" class="ml-auto" @click="openAddDialog">
          <v-icon left>mdi-plus</v-icon>
          Thêm lịch hẹn
        </v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card class="modern-card">
          <v-card-text>
            <v-text-field v-model="search" prepend-inner-icon="mdi-magnify"
              label="Tìm kiếm theo mã lịch hẹn, tên bệnh nhân..." single-line hide-details clearable
              class="modern-search"></v-text-field>
          </v-card-text>
          <div class="table-responsive">
            <table class="custom-appointment-table modern-table elevation-2" style="width:100%">
              <thead>
                <tr class="main-header-row">
                  <th class="main-header-cell left-radius">Mã lịch hẹn</th>
                  <th class="main-header-cell">Bệnh nhân</th>
                  <th class="main-header-cell">Bác sĩ</th>
                  <th class="main-header-cell">Ngày khám</th>
                  <th class="main-header-cell">Giờ khám</th>
                  <th class="main-header-cell">Trạng thái</th>
                  <th class="main-header-cell right-radius">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in paginatedAppointments" :key="item._id">
                  <td>{{ item.appointmentId }}</td>
                  <td>{{ item.patient?.fullName || 'N/A' }}</td>
                  <td>{{ item.doctor?.fullName || 'N/A' }}</td>
                  <td>{{ formatDate(item.appointmentDate) }}</td>
                  <td>{{ item.timeSlot?.startTime }} - {{ item.timeSlot?.endTime }}</td>
                  <td>
                    <v-chip :color="getStatusColor(item.status)" small dark>
                      {{ item.status }}
                    </v-chip>
                  </td>
                  <td>
                    <v-btn icon color="primary" @click="editAppointment(item)" class="mr-1 modern-action-btn">
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn icon color="error" @click="deleteAppointment(item)" class="modern-action-btn">
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </td>
                </tr>
                <tr v-if="!paginatedAppointments.length">
                  <td colspan="7" class="text-center">Không có dữ liệu</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="pagination-bar d-flex align-center justify-center mt-1" style="gap: 8px;">
            <span>Hiển thị</span>
            <v-select v-model="itemsPerPage" :items="[5, 10, 20, 50]" dense hide-details
              style="min-width: 70px; max-width: 90px;" />
            <span>{{ startItem }}-{{ endItem }} / {{ filteredAppointments.length.toLocaleString() }}</span>
            <v-btn icon :disabled="currentPage === 1" @click="currentPage = 1"><v-icon>mdi-page-first</v-icon></v-btn>
            <v-btn icon :disabled="currentPage === 1" @click="currentPage--"><v-icon>mdi-chevron-left</v-icon></v-btn>
            <v-btn icon :disabled="currentPage === pageCount"
              @click="currentPage++"><v-icon>mdi-chevron-right</v-icon></v-btn>
            <v-btn icon :disabled="currentPage === pageCount"
              @click="currentPage = pageCount"><v-icon>mdi-page-last</v-icon></v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Add/Edit Appointment Dialog -->
    <v-dialog v-model="showAddDialog" max-width="800px" persistent>
      <v-card>
        <v-card-title class="d-flex align-center pa-4 bg-primary">
          <span class="text-h5 text-white">{{ editedId ? 'Sửa lịch hẹn' : 'Thêm lịch hẹn mới' }}</span>
          <v-spacer></v-spacer>
          <v-btn icon variant="text" @click="closeDialog">
            <v-icon color="white">mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pa-4">
          <v-alert
            v-if="doctorScheduleError"
            type="warning"
            variant="tonal"
            class="mb-4"
          >
            {{ doctorScheduleError }}
          </v-alert>

          <v-container>
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.appointmentId"
                  label="Mã lịch hẹn"
                  readonly
                  :hint="editedId ? '' : 'Mã sẽ được tự động tạo khi lưu'"
                  persistent-hint
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-autocomplete
                  v-model="editedItem.patient"
                  :items="patientOptions"
                  label="Bệnh nhân"
                  required
                  :loading="loading"
                  :disabled="loading"
                  item-title="text"
                  item-value="value"
                  variant="outlined"
                  density="comfortable"
                ></v-autocomplete>
              </v-col>
              <v-col cols="12" sm="6">
                <v-autocomplete
                  v-model="editedItem.doctor"
                  :items="doctorOptions"
                  label="Bác sĩ"
                  required
                  :loading="loading"
                  :disabled="loading"
                  @update:model-value="loadDoctorSchedule"
                  item-title="text"
                  item-value="value"
                  variant="outlined"
                  density="comfortable"
                ></v-autocomplete>
              </v-col>
              <v-col cols="12" sm="6">
                <v-menu
                  ref="editDateMenu"
                  v-model="editDateMenu"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template v-slot:activator="{ props }">
                    <v-text-field
                      v-model="formattedEditDate"
                      label="Ngày khám"
                      prepend-inner-icon="mdi-calendar"
                      readonly
                      v-bind="props"
                      required
                      variant="outlined"
                      density="comfortable"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="editedItem.appointmentDate"
                    no-title
                    @input="editDateMenu = false; loadDoctorSchedule()"
                  ></v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="12">
                <div class="d-flex align-center gap-4">
                  <v-text-field
                    v-model="editedItem.timeSlot.startTime"
                    label="Giờ bắt đầu"
                    type="time"
                    required
                    :rules="[v => !!v || 'Vui lòng nhập giờ bắt đầu']"
                    :disabled="!editedItem.doctor || !editedItem.appointmentDate"
                    variant="outlined"
                    density="comfortable"
                    style="flex: 1"
                  ></v-text-field>
                  <span class="text-h6">-</span>
                  <v-text-field
                    v-model="editedItem.timeSlot.endTime"
                    label="Giờ kết thúc"
                    type="time"
                    required
                    :rules="[
                      v => !!v || 'Vui lòng nhập giờ kết thúc',
                      v => !editedItem.timeSlot.startTime || v > editedItem.timeSlot.startTime || 'Giờ kết thúc phải sau giờ bắt đầu'
                    ]"
                    :disabled="!editedItem.doctor || !editedItem.appointmentDate"
                    variant="outlined"
                    density="comfortable"
                    style="flex: 1"
                  ></v-text-field>
                </div>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="editedItem.status"
                  :items="statusOptions"
                  label="Trạng thái"
                  required
                  variant="outlined"
                  density="comfortable"
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="editedItem.reason"
                  label="Lý do khám"
                  rows="3"
                  variant="outlined"
                  density="comfortable"
                ></v-textarea>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn color="error" variant="outlined" @click="closeDialog">Hủy</v-btn>
          <v-btn
            color="primary"
            @click="saveAppointment"
            :disabled="!canSave || !isDoctorAvailable"
            class="ml-2"
          >
            Lưu
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h5">Xác nhận xóa lịch hẹn</v-card-title>
        <v-card-text>Bạn có chắc chắn muốn xóa lịch hẹn này không?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="showDeleteDialog = false">Hủy</v-btn>
          <v-btn color="red darken-1" text @click="confirmDelete">Xóa</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script>
import api from '@/plugins/api';
import { format, parseISO } from 'date-fns';
import Swal from 'sweetalert2';

export default {
  name: 'AppointmentList',
  data() {
    return {
      loading: false,
      search: '',
      appointments: [],
      doctors: [],
      patients: [],

      // Filters
      dateMenu: false,
      selectedDate: null,
      selectedDoctor: null,
      selectedStatus: null,
      statusOptions: ['Đã đặt lịch', 'Đã xác nhận', 'Đã check-in', 'Đang khám', 'Đã hoàn thành', 'Đã hủy'],

      // Dialogs
      showAddDialog: false,
      showDeleteDialog: false,

      // Editing
      editedId: null,
      editedItem: {
        appointmentId: '',
        patient: null,
        doctor: null,
        appointmentDate: null,
        timeSlot: {
          startTime: '',
          endTime: ''
        },
        reason: '',
        status: 'Đã đặt lịch',
      },
      defaultItem: {
        appointmentId: '',
        patient: null,
        doctor: null,
        appointmentDate: null,
        timeSlot: {
          startTime: '',
          endTime: ''
        },
        reason: '',
        status: 'Đã đặt lịch',
      },
      editDateMenu: false,
      availableTimeSlots: [],

      // Deleting
      deleteId: null,

      // Pagination
      currentPage: 1,
      itemsPerPage: 10,

      // Snackbar
      snackbar: {
        show: false,
        text: '',
        color: '',
      },

      doctorScheduleError: '',
    };
  },
  computed: {
    doctorOptions() {
      return this.doctors
        .filter(doctor => doctor.isAvailable) // chỉ lấy bác sĩ đang làm việc
        .map(doctor => ({
          text: doctor.fullName ? `${doctor.fullName} (${doctor.specialization || 'Chưa có chuyên môn'})` : 'Không có dữ liệu',
          value: doctor._id || null,
        }))
        .filter(option => option.value);
    },
    patientOptions() {
      return this.patients.map(patient => ({
        text: patient.fullName ? `${patient.fullName} - ${patient.patientId || 'N/A'}` : 'Không có dữ liệu',
        value: patient, // Lưu cả object bệnh nhân
      })).filter(option => option.value); // Loại bỏ các mục không hợp lệ
    },

    filteredAppointments() {
      let filtered = this.appointments;
      if (this.search) {
        const lowerSearch = this.search.toLowerCase();
        filtered = filtered.filter(item =>
          item.appointmentId.toLowerCase().includes(lowerSearch) ||
          (item.patient?.fullName && item.patient.fullName.toLowerCase().includes(lowerSearch)) ||
          (item.doctor?.fullName && item.doctor.fullName.toLowerCase().includes(lowerSearch))
        );
      }
      if (this.selectedDate) {
        filtered = filtered.filter(item => format(parseISO(item.appointmentDate), 'yyyy-MM-dd') === this.selectedDate);
      }
      if (this.selectedDoctor) {
        filtered = filtered.filter(item => item.doctor?._id === this.selectedDoctor);
      }
      if (this.selectedStatus) {
        filtered = filtered.filter(item => item.status === this.selectedStatus);
      }
      return filtered;
    },

    pageCount() {
      return Math.ceil(this.filteredAppointments.length / this.itemsPerPage);
    },
    startItem() {
      return (this.currentPage - 1) * this.itemsPerPage + 1;
    },
    endItem() {
      const end = this.currentPage * this.itemsPerPage;
      return end > this.filteredAppointments.length ? this.filteredAppointments.length : end;
    },
    paginatedAppointments() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredAppointments.slice(start, end);
    },
    formattedEditDate() {
      return this.editedItem.appointmentDate ? format(new Date(this.editedItem.appointmentDate), 'dd/MM/yyyy') : '';
    },
    canSave() {
      return this.editedItem.patient && 
             this.editedItem.doctor && 
             this.editedItem.appointmentDate && 
             this.editedItem.timeSlot.startTime && 
             this.editedItem.timeSlot.endTime;
    },
    isDoctorAvailable() {
      return !this.doctorScheduleError;
    },
  },
  watch: {
    showAddDialog(val) {
      val || this.closeDialog();
    },
    showDeleteDialog(val) {
      val || this.closeDeleteDialog();
    },
    'editedItem.doctor'() {
      this.loadDoctorSchedule();
    },
    'editedItem.appointmentDate'() {
      this.loadDoctorSchedule();
    },
  },
  async created() {
    await this.fetchInitialData();
    this.fetchAppointments();
  },
  methods: {
    async fetchAppointments() {
      this.loading = true;
      try {
        const response = await api.get('/appointments');
        this.appointments = response.data;
      } catch (error) {
        this.showSnackbar('Lỗi khi tải danh sách lịch hẹn', 'error');
        console.error("Error fetching appointments:", error);
      } finally {
        this.loading = false;
      }
    },
    async fetchInitialData() {
      try {
        const [doctorsRes, patientsRes] = await Promise.all([
          api.get('/doctors'),
          api.get('/patients'),
        ]);
        this.doctors = doctorsRes.data || [];
        this.patients = patientsRes.data || [];
      } catch (error) {
        this.showSnackbar('Lỗi khi tải dữ liệu bác sĩ/bệnh nhân', 'error');
        console.error("Error fetching initial data:", error);
        this.doctors = [];
        this.patients = [];
      }
    },
    clearDoctorScheduleError() {
      this.doctorScheduleError = '';
    },
    async loadDoctorSchedule() {
      this.clearDoctorScheduleError();
      
      // Nếu chưa chọn bác sĩ hoặc ngày khám thì return
      if (!this.editedItem.doctor || !this.editedItem.appointmentDate) {
        return;
      }

      try {
        const doctorId = typeof this.editedItem.doctor === 'object' ? this.editedItem.doctor.value : this.editedItem.doctor;
        const doctor = this.doctors.find(d => d._id === doctorId);
        
        if (!doctor) {
          this.doctorScheduleError = 'Không tìm thấy thông tin bác sĩ.';
          return;
        }

        if (!doctor.schedule || !Array.isArray(doctor.schedule) || doctor.schedule.length === 0) {
          this.doctorScheduleError = 'Bác sĩ chưa có lịch làm việc.';
          return;
        }

        const selectedDate = new Date(this.editedItem.appointmentDate);
        const selectedDay = selectedDate.getDay();
        
        // Map số thứ tự ngày (0-6) sang tên ngày
        const dayNames = {
          0: "Chủ Nhật",
          1: "Thứ 2",
          2: "Thứ 3",
          3: "Thứ 4",
          4: "Thứ 5",
          5: "Thứ 6",
          6: "Thứ 7"
        };
        
        const dayName = dayNames[selectedDay];
        console.log('Checking schedule for:', dayName, 'Doctor schedule:', doctor.schedule);

        // Tìm lịch làm việc cho ngày được chọn
        const scheduleForDay = doctor.schedule.find(s => {
          // Chuẩn hóa tên ngày để so sánh
          const scheduleDayName = s.dayOfWeek
            .replace("Thứ Hai", "Thứ 2")
            .replace("Thứ Ba", "Thứ 3")
            .replace("Thứ Tư", "Thứ 4")
            .replace("Thứ Năm", "Thứ 5")
            .replace("Thứ Sáu", "Thứ 6")
            .replace("Thứ Bảy", "Thứ 7");
          
          return scheduleDayName === dayName;
        });

        if (!scheduleForDay) {
          this.doctorScheduleError = `Bác sĩ ${doctor.fullName} không có lịch làm việc vào ${dayName.toLowerCase()}.`;
          return;
        }

        // Nếu có lịch làm việc thì clear error
        this.clearDoctorScheduleError();

        // Cập nhật giờ mặc định nếu đang tạo lịch hẹn mới
        if (!this.editedId && scheduleForDay.timeSlots && scheduleForDay.timeSlots.length > 0) {
          const firstSlot = scheduleForDay.timeSlots[0];
          this.editedItem.timeSlot = {
            startTime: firstSlot.startTime,
            endTime: firstSlot.endTime
          };
        }

      } catch (error) {
        console.error('Error checking doctor schedule:', error);
        this.doctorScheduleError = 'Có lỗi khi kiểm tra lịch làm việc của bác sĩ.';
      }
    },
    openAddDialog() {
      this.clearDoctorScheduleError();
      this.editedItem = { ...this.defaultItem };
      this.editedId = null;
      // Đảm bảo patient là null (object), không phải _id
      this.editedItem.patient = null;
      this.showAddDialog = true;
    },
    editAppointment(item) {
      this.clearDoctorScheduleError();
      this.editedId = item._id;
      // Map lại patient là object từ danh sách patients
      const patientObj = this.patients.find(p => p._id === (item.patient?._id || item.patient));
      this.editedItem = {
        ...item,
        doctor: item.doctor?._id,
        patient: patientObj || null,
      };
      this.loadDoctorSchedule();
      this.showAddDialog = true;
    },
    deleteAppointment(item) {
      this.deleteId = item._id;
      this.showDeleteDialog = true;
    },
    closeDialog() {
      this.showAddDialog = false;
      this.$nextTick(() => {
        this.clearDoctorScheduleError();
        this.editedItem = { ...this.defaultItem };
        this.editedId = null;
      });
    },
    closeDeleteDialog() {
      this.deleteId = null;
      this.showDeleteDialog = false;
    },
    async saveAppointment() {
      if (!this.isDoctorAvailable) {
        this.showSnackbar('Không thể lưu lịch hẹn vì bác sĩ không có lịch làm việc vào ngày này', 'error');
        return;
      }

      // Kiểm tra trạng thái bác sĩ
      const doctorObj = this.doctors.find(d => d._id === this.editedItem.doctor);
      if (!doctorObj || !doctorObj.isAvailable) {
        this.showSnackbar('Bác sĩ này hiện không khả dụng để đặt lịch!', 'error');
        return;
      }

      try {
        // Đảm bảo patient là object và có phone
        let patientObj = this.editedItem.patient;
        if (typeof patientObj !== 'object' || !patientObj.phone) {
          this.showSnackbar('Vui lòng chọn bệnh nhân hợp lệ', 'error');
          return;
        }
        const payload = {
          doctor: this.editedItem.doctor,
          appointmentDate: this.editedItem.appointmentDate,
          timeSlot: this.editedItem.timeSlot,
          reason: this.editedItem.reason,
          status: this.editedItem.status,
          phone: patientObj.phone, // BẮT BUỘC để backend nhận diện bệnh nhân cũ
          // Có thể gửi thêm các trường sau nếu muốn:
          // fullName: patientObj.fullName,
          // dateOfBirth: patientObj.dateOfBirth,
          // gender: patientObj.gender,
          // address: patientObj.address,
          // email: patientObj.email,
        };

        if (!this.editedId) {
          // Tạo mã lịch hẹn tự động dạng APxxxxx
          // Lấy tất cả mã hiện có, tìm số lớn nhất
          const allIds = this.appointments
            .map(a => a.appointmentId)
            .filter(id => /^AP\d+$/.test(id));
          let maxNum = 0;
          allIds.forEach(id => {
            const num = parseInt(id.replace('AP', ''));
            if (!isNaN(num) && num > maxNum) maxNum = num;
          });
          payload.appointmentId = 'AP' + (maxNum + 1).toString().padStart(5, '0');
        }

        if (this.editedId) {
          await api.put(`/appointments/${this.editedId}`, payload);
          this.showSnackbar('Cập nhật lịch hẹn thành công', 'success');
        } else {
          await api.post('/appointments', payload);
          this.showSnackbar('Thêm lịch hẹn thành công', 'success');
        }
        this.fetchAppointments();
        this.closeDialog();
      } catch (error) {
        this.showSnackbar(error.response?.data?.message || 'Lỗi khi lưu lịch hẹn', 'error');
        console.error("Error saving appointment:", error);
      }
    },
    async confirmDelete() {
      try {
        await api.delete(`/appointments/${this.deleteId}`);
        this.showSnackbar('Xóa lịch hẹn thành công', 'success');
        this.fetchAppointments();
        this.closeDeleteDialog();
      } catch (error) {
        this.showSnackbar(error.response?.data?.message || 'Lỗi khi xóa lịch hẹn', 'error');
        console.error("Error deleting appointment:", error);
      }
    },
    formatDate(date) {
      if (!date) return '';
      try {
        return format(parseISO(date), 'dd/MM/yyyy');
      } catch (error) {
        return 'N/A';
      }
    },
    getStatusColor(status) {
      switch (status) {
        case 'Đã đặt lịch': return 'blue';
        case 'Đã xác nhận': return 'light-blue';
        case 'Đã check-in': return 'teal';
        case 'Đang khám': return 'orange';
        case 'Đã hoàn thành': return 'green';
        case 'Đã hủy': return 'red';
        default: return 'grey';
      }
    },
    showSnackbar(text, color) {
      this.snackbar.text = text;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },
    showSuccess(msg) {
      Swal.fire({
        icon: 'success',
        title: msg || 'Thành công!',
        position: 'top',
        showConfirmButton: false,
        timer: 2000,
        toast: true,
        customClass: { popup: 'swal2-popup-custom' }
      });
    },
    showError(msg) {
      Swal.fire({
        icon: 'error',
        title: msg || 'Có lỗi xảy ra!',
        position: 'top',
        showConfirmButton: false,
        timer: 3000,
        toast: true,
        customClass: { popup: 'swal2-popup-custom' }
      });
    },
  },
};
</script>

<style scoped>
.main-title {
  color: #1976d2;
  font-size: 2.2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  letter-spacing: 1px;
  text-shadow: 0 2px 8px rgba(33, 150, 243, 0.08);
}

.filter-bar {
  background: #f8fafc;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 1rem;
  align-items: center;
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

.custom-appointment-table th, .custom-appointment-table td {
  border: 1px solid #e0e0e0;
}
.custom-appointment-table th {
  border: none;
}
.custom-appointment-table tr:last-child td {
  border-bottom: none;
}

.modern-table {
  border-collapse: separate;
  border-spacing: 0;
  width: 100%;
  border-radius: 8px;
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
  font-size: 0.9rem;
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
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;
}

.right-radius {
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
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
  transform: scale(1.1);
}

.pagination-bar {
  padding: 12px 16px;
  background-color: #f8f8f8;
}
</style>