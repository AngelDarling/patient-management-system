<template>
  <div class="appointment-details">
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center mb-4">
          <v-btn
            icon
            class="mr-4"
            :to="{ name: 'Appointments' }"
          >
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <h1 class="text-h4">Chi tiết lịch hẹn</h1>
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

    <template v-else-if="appointment">
      <v-row>
        <v-col cols="12" md="8">
          <v-card>
            <v-card-title>
              <v-icon left color="primary">mdi-calendar-clock</v-icon>
              Thông tin lịch hẹn
            </v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" sm="6">
                  <div class="subtitle-1 font-weight-bold">Ngày khám</div>
                  <div>{{ formatDate(appointment.appointmentDate) }}</div>
                </v-col>
                <v-col cols="12" sm="6">
                  <div class="subtitle-1 font-weight-bold">Giờ khám</div>
                  <div>{{ appointment.timeSlot.startTime }} - {{ appointment.timeSlot.endTime }}</div>
                </v-col>
                <v-col cols="12" sm="6">
                  <div class="subtitle-1 font-weight-bold">Bác sĩ</div>
                  <div>{{ appointment.doctorName }}</div>
                </v-col>
                <v-col cols="12" sm="6">
                  <div class="subtitle-1 font-weight-bold">Bệnh nhân</div>
                  <div>{{ appointment.patientName }}</div>
                </v-col>
                <v-col cols="12">
                  <div class="subtitle-1 font-weight-bold">Lý do khám</div>
                  <div>{{ appointment.reason }}</div>
                </v-col>
                <v-col cols="12" sm="6">
                  <div class="subtitle-1 font-weight-bold">Trạng thái</div>
                  <v-chip
                    :color="getStatusColor(appointment.status)"
                    small
                  >
                    {{ appointment.status }}
                  </v-chip>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card>
            <v-card-title>
              <v-icon left color="primary">mdi-history</v-icon>
              Lịch sử cập nhật
            </v-card-title>
            <v-card-text>
              <v-timeline dense>
                <v-timeline-item
                  v-for="(update, index) in appointment.statusHistory"
                  :key="index"
                  :color="getStatusColor(update.status)"
                  small
                >
                  <div class="font-weight-bold">{{ update.status }}</div>
                  <div class="text-caption">
                    {{ formatDateTime(update.timestamp) }}
                  </div>
                  <div v-if="update.note" class="text-caption">
                    {{ update.note }}
                  </div>
                </v-timeline-item>
              </v-timeline>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mt-4">
        <v-col cols="12">
          <v-card>
            <v-card-title>
              <v-icon left color="primary">mdi-file-document</v-icon>
              Hồ sơ bệnh án
            </v-card-title>
            <v-card-text>
              <template v-if="appointment.medicalRecord">
                <v-row>
                  <v-col cols="12" sm="6">
                    <div class="subtitle-1 font-weight-bold">Chẩn đoán</div>
                    <div>{{ appointment.medicalRecord.diagnosis }}</div>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <div class="subtitle-1 font-weight-bold">Điều trị</div>
                    <div>{{ appointment.medicalRecord.treatment }}</div>
                  </v-col>
                  <v-col cols="12">
                    <div class="subtitle-1 font-weight-bold">Ghi chú</div>
                    <div>{{ appointment.medicalRecord.notes }}</div>
                  </v-col>
                </v-row>
              </template>
              <div v-else class="text-center pa-4">
                Chưa có hồ sơ bệnh án
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <v-row v-else>
      <v-col cols="12">
        <v-alert type="error">
          Không tìm thấy thông tin lịch hẹn
        </v-alert>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import moment from 'moment'

export default {
  name: 'AppointmentDetails',
  setup () {
    const store = useStore()
    const route = useRoute()
    const loading = computed(() => store.getters.isLoading)
    const appointment = ref(null)

    onMounted(async () => {
      try {
        const response = await store.dispatch('getAppointment', route.params.id)
        appointment.value = response
      } catch (error) {
        console.error('Error fetching appointment details:', error)
      }
    })

    const formatDate = (date) => {
      return moment(date).format('DD/MM/YYYY')
    }

    const formatDateTime = (date) => {
      return moment(date).format('DD/MM/YYYY HH:mm')
    }

    const getStatusColor = (status) => {
      const colors = {
        'Đã đặt lịch': 'primary',
        'Đã xác nhận': 'success',
        'Đã hoàn thành': 'info',
        'Đã hủy': 'error'
      }
      return colors[status] || 'grey'
    }

    return {
      loading,
      appointment,
      formatDate,
      formatDateTime,
      getStatusColor
    }
  }
}
</script>
