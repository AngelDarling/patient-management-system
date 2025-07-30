<template>
  <div class="doctor-details">
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center mb-4">
          <v-btn
            icon
            class="mr-4"
            :to="{ name: 'Doctors' }"
          >
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <h1 class="text-h4">Thông tin bác sĩ</h1>
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

    <template v-else-if="doctor">
      <v-row>
        <v-col cols="12" md="8">
          <v-card>
            <v-card-title>
              <v-icon left color="primary">mdi-account</v-icon>
              Thông tin cá nhân
            </v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" sm="6">
                  <div class="subtitle-1 font-weight-bold">Mã nhân viên</div>
                  <div>{{ doctor.staffId }}</div>
                </v-col>
                <v-col cols="12" sm="6">
                  <div class="subtitle-1 font-weight-bold">Họ và tên</div>
                  <div>{{ doctor.fullName }}</div>
                </v-col>
                <v-col cols="12" sm="6">
                  <div class="subtitle-1 font-weight-bold">Chuyên khoa</div>
                  <div>{{ doctor.specialization }}</div>
                </v-col>
                <v-col cols="12" sm="6">
                  <div class="subtitle-1 font-weight-bold">Trạng thái</div>
                  <v-chip
                    :color="doctor.isAvailable ? 'success' : 'error'"
                    small
                  >
                    {{ doctor.isAvailable ? 'Đang làm việc' : 'Nghỉ' }}
                  </v-chip>
                </v-col>
                <v-col cols="12" sm="6">
                  <div class="subtitle-1 font-weight-bold">Số điện thoại</div>
                  <div>{{ doctor.phone }}</div>
                </v-col>
                <v-col cols="12" sm="6">
                  <div class="subtitle-1 font-weight-bold">Email</div>
                  <div>{{ doctor.email }}</div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card>
            <v-card-title>
              <v-icon left color="primary">mdi-calendar</v-icon>
              Lịch làm việc
            </v-card-title>
            <v-card-text>
              <template v-if="doctor.schedule && doctor.schedule.length">
                <v-list dense>
                  <v-list-item
                    v-for="(day, index) in doctor.schedule"
                    :key="index"
                  >
                    <v-list-item-content>
                      <v-list-item-title>{{ day.dayOfWeek }}</v-list-item-title>
                      <v-list-item-subtitle>
                        <v-list dense>
                          <v-list-item
                            v-for="(slot, index) in day.timeSlots"
                            :key="index"
                          >
                            <template #prepend>
                              <v-icon>mdi-clock-outline</v-icon>
                            </template>
                            <v-list-item-title>
                              {{ slot.startTime }} - {{ slot.endTime }}
                            </v-list-item-title>
                            <template #append>
                              <v-chip
                                v-if="!slot.isBooked"
                                color="green"
                                text-color="white"
                                small
                              >
                                Còn trống
                              </v-chip>
                              <v-chip v-else color="red" text-color="white" small>
                                Đã đặt
                              </v-chip>
                            </template>
                          </v-list-item>
                        </v-list>
                      </v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </template>
              <div v-else class="text-center pa-4">
                Chưa có lịch làm việc
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mt-4">
        <v-col cols="12">
          <v-card>
            <v-card-title>
              <v-icon left color="primary">mdi-calendar-clock</v-icon>
              Lịch hẹn sắp tới
            </v-card-title>
            <v-card-text>
              <v-data-table
                :headers="appointmentHeaders"
                :items="upcomingAppointments"
                :loading="loading"
                :items-per-page="5"
              >
                <template #item.appointmentDate="{ item }">
                  {{ formatDate(item.appointmentDate) }}
                </template>
                <template #item.status="{ item }">
                  <v-chip
                    :color="getStatusColor(item.status)"
                    small
                  >
                    {{ item.status }}
                  </v-chip>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <v-row v-else>
      <v-col cols="12">
        <v-alert type="error">
          Không tìm thấy thông tin bác sĩ
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
  name: 'DoctorDetails',
  setup () {
    const store = useStore()
    const route = useRoute()
    const loading = computed(() => store.getters.isLoading)
    const doctor = ref(null)
    const upcomingAppointments = ref([])

    const appointmentHeaders = [
      { text: 'Ngày khám', value: 'appointmentDate' },
      { text: 'Giờ khám', value: 'timeSlot.startTime' },
      { text: 'Bệnh nhân', value: 'patientName' },
      { text: 'Lý do khám', value: 'reason' },
      { text: 'Trạng thái', value: 'status' }
    ]

    onMounted(async () => {
      try {
        const response = await store.dispatch('getDoctor', route.params.id)
        doctor.value = response
        // Fetch upcoming appointments
        const appointments = await store.dispatch('getDoctorAppointments', route.params.id)
        upcomingAppointments.value = appointments.filter(appointment => {
          return moment(appointment.appointmentDate).isSameOrAfter(moment(), 'day')
        })
      } catch (error) {
        console.error('Error fetching doctor details:', error)
      }
    })

    const formatTimeSlots = (timeSlots) => {
      if (!timeSlots || !timeSlots.length) return ''
      return timeSlots.map(slot => `${slot.startTime} - ${slot.endTime}`).join(', ')
    }

    const formatDate = (date) => {
      return moment(date).format('DD/MM/YYYY')
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
      doctor,
      upcomingAppointments,
      appointmentHeaders,
      formatTimeSlots,
      formatDate,
      getStatusColor
    }
  }
}
</script>
