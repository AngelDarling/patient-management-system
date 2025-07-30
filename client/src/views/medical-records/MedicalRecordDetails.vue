<template>
  <div class="medical-record-details">
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center mb-4">
          <v-btn
            icon
            class="mr-4"
            @click="goBack"
          >
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <h1 class="text-h4">Chi tiết hồ sơ bệnh án</h1>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="showEditDialog = true" v-if="canEdit">
            <v-icon left>mdi-pencil</v-icon>Sửa
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <v-row v-if="loading">
      <v-col cols="12" class="text-center">
        <v-progress-circular
          indeterminate
          color="primary"
        ></v-progress-circular>
      </v-col>
    </v-row>

    <template v-else-if="record">
      <v-row>
        <v-col cols="12" md="8">
          <v-card>
            <v-card-title>
              <v-icon left color="primary">mdi-file-document</v-icon>
              Thông tin bệnh án
            </v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" sm="6">
                  <div class="subtitle-1 font-weight-bold">Bệnh nhân</div>
                  <div>{{ record.patientName }}</div>
                </v-col>
                <v-col cols="12" sm="6">
                  <div class="subtitle-1 font-weight-bold">Bác sĩ</div>
                  <div>{{ record.doctorName }}</div>
                </v-col>
                <v-col cols="12">
                  <div class="subtitle-1 font-weight-bold">Chẩn đoán</div>
                  <div>{{ record.diagnosis }}</div>
                </v-col>
                <v-col cols="12">
                  <div class="subtitle-1 font-weight-bold">Phương pháp điều trị</div>
                  <div>{{ record.treatment }}</div>
                </v-col>
                <v-col cols="12">
                  <div class="subtitle-1 font-weight-bold">Đơn thuốc</div>
                  <div>{{ record.prescription || 'Không có' }}</div>
                </v-col>
                <v-col cols="12">
                  <div class="subtitle-1 font-weight-bold">Ghi chú</div>
                  <div>{{ record.notes || 'Không có' }}</div>
                </v-col>
                <v-col cols="12" sm="6">
                  <div class="subtitle-1 font-weight-bold">Ngày tạo</div>
                  <div>{{ formatDate(record.createdAt) }}</div>
                </v-col>
                <v-col cols="12" sm="6">
                  <div class="subtitle-1 font-weight-bold">Cập nhật lần cuối</div>
                  <div>{{ formatDate(record.updatedAt) }}</div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card>
            <v-card-title>
              <v-icon left color="primary">mdi-calendar-clock</v-icon>
              Lịch hẹn liên quan
            </v-card-title>
            <v-card-text>
              <template v-if="relatedAppointments.length">
                <v-list dense>
                  <v-list-item v-for="item in relatedAppointments" :key="item._id">
                    <v-list-item-content>
                      <v-list-item-title>
                        Ngày khám: {{ formatDate(item.appointmentDate) }}
                      </v-list-item-title>
                      <v-list-item-subtitle>
                        Giờ: {{ item.timeSlot.startTime }} - {{ item.timeSlot.endTime }}
                      </v-list-item-subtitle>
                      <v-list-item-subtitle>
                        Lý do: {{ item.reason }}
                      </v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-action>
                      <v-btn icon @click="goToAppointment(item._id)">
                        <v-icon>mdi-eye</v-icon>
                      </v-btn>
                    </v-list-item-action>
                  </v-list-item>
                </v-list>
              </template>
              <div v-else class="text-center pa-4">
                Không có lịch hẹn liên quan
              </div>
            </v-card-text>
          </v-card>

          <v-card class="mt-4">
            <v-card-title class="d-flex align-center justify-space-between">
              <span><v-icon left color="primary">mdi-history</v-icon>Lịch sử bệnh án</span>
              <v-btn icon small @click="showAddHistory = true">
                <v-icon color="primary">mdi-plus</v-icon>
              </v-btn>
            </v-card-title>
            <v-card-text>
              <v-timeline dense>
                <v-timeline-item
                  v-for="(history, index) in record.medicalHistory"
                  :key="index"
                  small
                >
                  <div class="font-weight-bold">{{ history.title }}</div>
                  <div class="text-caption">
                    {{ formatDate(history.date) }}
                  </div>
                  <div>{{ history.description }}</div>
                </v-timeline-item>
              </v-timeline>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mt-4">
        <v-col cols="12">
          <v-card>
            <v-card-title class="d-flex align-center justify-space-between">
              <span><v-icon left color="primary">mdi-attachment</v-icon>Tài liệu đính kèm</span>
              <v-btn icon small @click="showUploadDialog = true">
                <v-icon color="primary">mdi-upload</v-icon>
              </v-btn>
            </v-card-title>
            <v-card-text>
              <template v-if="record.attachments && record.attachments.length">
                <v-list dense>
                  <v-list-item
                    v-for="(attachment, index) in record.attachments"
                    :key="index"
                  >
                    <v-list-item-icon>
                      <v-icon>mdi-file</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>{{ attachment.name }}</v-list-item-title>
                      <v-list-item-subtitle>
                        Tải lên: {{ formatDate(attachment.uploadDate) }}
                      </v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-action>
                      <v-btn
                        icon
                        small
                        @click="downloadAttachment(attachment)"
                      >
                        <v-icon>mdi-download</v-icon>
                      </v-btn>
                      <v-btn icon small color="error" @click="deleteAttachment(attachment)">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </v-list-item-action>
                  </v-list-item>
                </v-list>
              </template>
              <div v-else class="text-center pa-4">
                Không có tài liệu đính kèm
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Dialog thêm lịch sử bệnh án -->
      <v-dialog v-model="showAddHistory" max-width="500px">
        <v-card>
          <v-card-title>Thêm lịch sử bệnh án</v-card-title>
          <v-card-text>
            <v-text-field v-model="newHistory.title" label="Tiêu đề" required></v-text-field>
            <v-textarea v-model="newHistory.description" label="Mô tả" rows="3" required></v-textarea>
            <v-menu v-model="historyDateMenu" :close-on-content-click="false" transition="scale-transition" offset-y>
              <template v-slot:activator="{ props }">
                <v-text-field v-model="newHistory.date" label="Ngày" prepend-inner-icon="mdi-calendar" readonly v-bind="props"></v-text-field>
              </template>
              <v-date-picker v-model="newHistory.date" no-title scrollable @input="historyDateMenu = false"></v-date-picker>
            </v-menu>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="showAddHistory = false">Hủy</v-btn>
            <v-btn color="primary" @click="addMedicalHistory">Lưu</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Dialog upload tài liệu -->
      <v-dialog v-model="showUploadDialog" max-width="500px">
        <v-card>
          <v-card-title>Tải lên tài liệu đính kèm</v-card-title>
          <v-card-text>
            <v-file-input v-model="uploadFile" label="Chọn file" prepend-icon="mdi-paperclip"></v-file-input>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="showUploadDialog = false">Hủy</v-btn>
            <v-btn color="primary" :disabled="!uploadFile" @click="uploadAttachment">Tải lên</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="showEditDialog" max-width="700px">
        <v-card>
          <v-card-title>Sửa hồ sơ bệnh án</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="handleEditSubmit">
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field v-model="editPatientName" label="Họ tên bệnh nhân" required />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field v-model="editPatientPhone" label="Số điện thoại bệnh nhân" required />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field v-model="editPatientDob" label="Ngày sinh" type="date" required />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-select v-model="editPatientGender" :items="['Nam', 'Nữ', 'Khác']" label="Giới tính" required />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field v-model="editPatientEmail" label="Email bệnh nhân" />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field v-model="editPatientAddress" label="Địa chỉ bệnh nhân" required />
                </v-col>
                <v-col cols="12">
                  <v-textarea v-model="editDiagnosis" label="Chẩn đoán" required rows="2" />
                </v-col>
                <v-col cols="12">
                  <v-textarea v-model="editTreatment" label="Phương pháp điều trị" required rows="2" />
                </v-col>
                <v-col cols="12">
                  <v-textarea v-model="editPrescription" label="Đơn thuốc" rows="2" />
                </v-col>
                <v-col cols="12">
                  <v-textarea v-model="editNotes" label="Ghi chú" rows="2" />
                </v-col>
              </v-row>
              <v-btn type="submit" color="primary" class="mt-4" :loading="editLoading">Lưu thay đổi</v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-dialog>
    </template>

    <v-row v-else>
      <v-col cols="12">
        <v-alert type="error">
          Không tìm thấy thông tin hồ sơ bệnh án
        </v-alert>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import moment from 'moment'
import axios from 'axios'
import Swal from 'sweetalert2'

export default {
  name: 'MedicalRecordDetails',
  setup () {
    const store = useStore()
    const route = useRoute()
    const router = useRouter()
    const loading = computed(() => store.getters.isLoading)
    const record = ref(null)
    const relatedAppointments = ref([])
    const showAddHistory = ref(false)
    const showUploadDialog = ref(false)
    const newHistory = ref({ title: '', description: '', date: moment().format('YYYY-MM-DD') })
    const historyDateMenu = ref(false)
    const uploadFile = ref(null)
    const showEditDialog = ref(false);
    const editDiagnosis = ref('');
    const editTreatment = ref('');
    const editPrescription = ref('');
    const editNotes = ref('');
    const editLoading = ref(false);
    const canEdit = computed(() => {
      const doctorUser = sessionStorage.getItem('doctorUser');
      if (!doctorUser) return false;
      try {
        const user = JSON.parse(doctorUser);
        return !user.isAdmin;
      } catch {
        return false;
      }
    });

    const editPatientName = ref('');
    const editPatientPhone = ref('');
    const editPatientDob = ref('');
    const editPatientGender = ref('');
    const editPatientEmail = ref('');
    const editPatientAddress = ref('');

    onMounted(async () => {
      try {
        const response = await store.dispatch('getMedicalRecord', route.params.id)
        record.value = response
        if (response.patient && response.patient._id && response.doctor && response.doctor._id) {
          let all = await store.dispatch('fetchAppointmentsByPatientAndDoctor', {
            patientId: response.patient._id,
            doctorId: response.doctor._id
          })
          // Lọc lại trên client cho chắc chắn
          relatedAppointments.value = all.filter(item =>
            item.patient && item.patient._id === response.patient._id &&
            item.doctor && item.doctor._id === response.doctor._id
          )
        }
      } catch (error) {
        console.error('Error fetching medical record details:', error)
      }
    })

    const formatDate = (date) => {
      return moment(date).format('DD/MM/YYYY')
    }

    const goToAppointment = (id) => {
      router.push({ name: 'AppointmentDetails', params: { id } })
    }

    const downloadAttachment = async (attachment) => {
      try {
        await store.dispatch('downloadAttachment', {
          recordId: record.value._id,
          attachmentId: attachment._id
        })
      } catch (error) {
        console.error('Error downloading attachment:', error)
      }
    }

    const deleteAttachment = async (attachment) => {
      try {
        await store.dispatch('deleteAttachment', {
          recordId: record.value._id,
          attachmentId: attachment._id
        })
        const response = await store.dispatch('getMedicalRecord', route.params.id)
        record.value = response
      } catch (error) {
        console.error('Error deleting attachment:', error)
      }
    }

    const addMedicalHistory = async () => {
      if (!newHistory.value.title || !newHistory.value.description || !newHistory.value.date) return
      try {
        await store.dispatch('addMedicalHistory', {
          id: record.value._id,
          data: {
            title: newHistory.value.title,
            description: newHistory.value.description,
            date: newHistory.value.date
          }
        })
        const response = await store.dispatch('getMedicalRecord', route.params.id)
        record.value = response
        showAddHistory.value = false
        newHistory.value = { title: '', description: '', date: moment().format('YYYY-MM-DD') }
      } catch (error) {
        console.error('Error adding medical history:', error)
      }
    }

    const uploadAttachment = async () => {
      if (!uploadFile.value) return
      try {
        await store.dispatch('uploadAttachment', {
          recordId: record.value._id,
          file: uploadFile.value
        })
        const response = await store.dispatch('getMedicalRecord', route.params.id)
        record.value = response
        showUploadDialog.value = false
        uploadFile.value = null
      } catch (error) {
        console.error('Error uploading attachment:', error)
      }
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

    function goBack() {
      if (route.path.startsWith('/doctor/medical-records/')) {
        router.push('/doctor/medical-record-history');
      } else {
        router.push({ name: 'MedicalRecords' });
      }
    }

    function openEditDialog() {
      if (!record.value) return;
      // Populate patient fields
      const p = record.value.patient || {};
      editPatientName.value = p.fullName || '';
      editPatientPhone.value = p.phone || '';
      editPatientDob.value = p.dateOfBirth ? p.dateOfBirth.substr(0, 10) : '';
      editPatientGender.value = p.gender || '';
      editPatientEmail.value = p.email || '';
      editPatientAddress.value = p.address || '';
      // Populate medical record fields
      editDiagnosis.value = record.value.diagnosis;
      editTreatment.value = record.value.treatment;
      editPrescription.value = record.value.prescription;
      editNotes.value = record.value.notes;
      showEditDialog.value = true;
    }

    async function handleEditSubmit() {
      editLoading.value = true;
      try {
        // Update patient
        await store.dispatch('updatePatient', {
          id: record.value.patient._id,
          data: {
            fullName: editPatientName.value,
            phone: editPatientPhone.value,
            dateOfBirth: editPatientDob.value,
            gender: editPatientGender.value,
            email: editPatientEmail.value,
            address: editPatientAddress.value
          }
        });
        // Update medical record
        await store.dispatch('updateMedicalRecord', {
          id: record.value._id,
          data: {
            diagnosis: editDiagnosis.value,
            treatment: editTreatment.value,
            prescription: editPrescription.value,
            notes: editNotes.value
          }
        });
        Swal.fire({ icon: 'success', title: 'Cập nhật hồ sơ thành công!' });
        showEditDialog.value = false;
        location.reload();
      } catch (error) {
        Swal.fire({ icon: 'error', title: 'Lỗi', text: error?.response?.data?.message || error.message });
      } finally {
        editLoading.value = false;
      }
    }

    return {
      loading,
      record,
      relatedAppointments,
      formatDate,
      goToAppointment,
      downloadAttachment,
      deleteAttachment,
      showAddHistory,
      newHistory,
      addMedicalHistory,
      historyDateMenu,
      showUploadDialog,
      uploadFile,
      uploadAttachment,
      showSuccess,
      showError,
      showEditDialog,
      editDiagnosis,
      editTreatment,
      editPrescription,
      editNotes,
      editLoading,
      canEdit,
      goBack,
      openEditDialog,
      handleEditSubmit,
      editPatientName,
      editPatientPhone,
      editPatientDob,
      editPatientGender,
      editPatientEmail,
      editPatientAddress
    }
  }
}
</script>

<style scoped>
.medical-record-details {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 8px;
}
.v-card-title {
  font-weight: 600;
  font-size: 1.1rem;
}
.v-card {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
}
.v-list-item {
  border-bottom: 1px solid #e0e0e0;
}
.v-list-item:last-child {
  border-bottom: none;
}
.v-timeline-item {
  margin-bottom: 8px;
}
</style>
