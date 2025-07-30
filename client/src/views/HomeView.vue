<template>
  <div class="home-dashboard">
    <v-row justify="center" class="mb-6">
      <v-col cols="12">
        <h1 class="text-h2 font-weight-bold mb-2 primary--text text-center">Hệ thống Quản lý Phòng khám</h1>
      </v-col>
    </v-row>

    <v-row justify="center" class="mb-6">
      <v-col cols="12" md="3" v-for="item in quickLinks" :key="item.title">
        <v-card
          :to="item.path"
          hover
          component="RouterLink"
          class="quick-link-card elevation-3"
        >
          <v-card-title class="justify-center">
            <v-icon size="48" :color="item.color" class="mb-2">{{ item.icon }}</v-icon>
          </v-card-title>
          <v-card-title class="justify-center text-h6 font-weight-bold">{{ item.title }}</v-card-title>
          <v-card-text class="text-center text-subtitle-2">{{ item.desc }}</v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4" justify="center" align="stretch">
      <v-col cols="12" md="6">
        <v-card class="elevation-2">
          <v-card-title class="pb-0">
            <v-icon left color="primary">mdi-calendar-clock</v-icon>
            Lịch hẹn hôm nay
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item v-for="appointment in todayAppointments" :key="appointment._id">
                <div>
                  <div class="font-weight-bold">{{ appointment.patientName }}</div>
                  <div class="text-subtitle-2">{{ appointment.time }} - Bác sĩ {{ appointment.doctorName }}</div>
                </div>
              </v-list-item>
              <v-list-item v-if="todayAppointments.length === 0">
                <div class="text-grey">Không có lịch hẹn nào hôm nay.</div>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card class="elevation-2">
          <v-card-title class="pb-0">
            <v-icon left color="primary">mdi-chart-bar</v-icon>
            Thống kê
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="6" class="text-center">
                <v-icon size="40" color="info" class="mb-1">mdi-account-group</v-icon>
                <div class="text-h4 font-weight-bold mb-1">{{ stats.totalPatients }}</div>
                <div class="text-subtitle-1">Tổng số bệnh nhân</div>
              </v-col>
              <v-col cols="6" class="text-center">
                <v-icon size="40" color="success" class="mb-1">mdi-calendar-check</v-icon>
                <div class="text-h4 font-weight-bold mb-1">{{ stats.totalAppointments }}</div>
                <div class="text-subtitle-1">Lịch hẹn trong tuần</div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'HomeView',
  setup () {
    const store = useStore()
    const todayAppointments = ref([])
    const stats = ref({
      totalPatients: 0,
      totalAppointments: 0
    })

    // Quick links config
    const quickLinks = [
      {
        title: 'Bệnh nhân',
        path: '/patients',
        icon: 'mdi-account-multiple',
        color: 'info',
        desc: 'Quản lý thông tin bệnh nhân'
      },
      {
        title: 'Bác sĩ',
        path: '/doctors',
        icon: 'mdi-stethoscope',
        color: 'success',
        desc: 'Quản lý thông tin bác sĩ'
      },
      {
        title: 'Lịch hẹn',
        path: '/appointments',
        icon: 'mdi-calendar',
        color: 'primary',
        desc: 'Quản lý lịch hẹn khám bệnh'
      },
      {
        title: 'Hồ sơ bệnh án',
        path: '/medical-records',
        icon: 'mdi-file-document',
        color: 'deep-purple',
        desc: 'Quản lý hồ sơ bệnh án'
      }
    ]

    onMounted(async () => {
      // Fetch today's appointments
      await store.dispatch('fetchAppointments')
      todayAppointments.value = store.getters.appointments.filter(appointment => {
        const today = new Date()
        const appointmentDate = new Date(appointment.appointmentDate)
        return appointmentDate.toDateString() === today.toDateString()
      })

      // Fetch statistics
      await store.dispatch('fetchPatients')
      stats.value.totalPatients = store.getters.patients.length
      stats.value.totalAppointments = store.getters.appointments.length
    })

    return {
      todayAppointments,
      stats,
      quickLinks
    }
  }
}
</script>

<style scoped>
.home-dashboard {
  background: #f7f9fb;
  min-height: 100vh;
  padding: 32px 0 0 0;
}
.quick-link-card {
  border-radius: 18px;
  transition: box-shadow 0.2s, transform 0.2s;
  cursor: pointer;
}
.quick-link-card:hover {
  box-shadow: 0 8px 24px rgba(60,60,60,0.12);
  transform: translateY(-4px) scale(1.03);
}
</style>
