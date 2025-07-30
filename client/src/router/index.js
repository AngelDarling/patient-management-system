import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DoctorList from '../views/doctors/DoctorList.vue'
import DoctorDetails from '../views/doctors/DoctorDetails.vue'
import AppointmentList from '../views/appointments/AppointmentList.vue'
import DoctorHome from '../views/doctors/DoctorHome.vue'

const routes = [
  {
    path: '/',
    redirect: '/admin'
  },
  {
    path: '/patients',
    name: 'Patients',
    component: () => import('../views/patients/PatientList.vue'),
    meta: { requiresAdmin: true }
  },
  // {
  //   path: '/patients/:id',
  //   name: 'PatientDetails',
  //   component: () => import('../views/patients/PatientDetails.vue')
  // },
  {
    path: '/doctors',
    name: 'Doctors',
    component: DoctorList,
    meta: { requiresAdmin: true }
  },
  {
    path: '/doctors/:id',
    name: 'DoctorDetails',
    component: DoctorDetails,
    meta: { requiresAdmin: true }
  },
  {
    path: '/appointments',
    name: 'Appointments',
    component: AppointmentList,
    meta: { requiresAdmin: true }
  },
  {
    path: '/appointments/:id',
    name: 'AppointmentDetails',
    component: () => import('../views/appointments/AppointmentDetails.vue'),
    meta: { requiresAdmin: true }
  },
  // {
  //   path: '/appointments/new',
  //   name: 'AppointmentForm',
  //   component: () => import('../views/appointments/AppointmentForm.vue')
  // },
  {
    path: '/medical-records',
    name: 'MedicalRecords',
    component: () => import('../views/medical-records/MedicalRecordList.vue'),
    meta: { requiresAdmin: true }
  },
  {
    path: '/medical-records/:id',
    name: 'MedicalRecordDetails',
    component: () => import('../views/medical-records/MedicalRecordDetails.vue'),
    meta: { requiresAdmin: true }
  },
  {
    path: '/homepage',
    name: 'PublicHome',
    component: () => import('@/views/public/PublicHome.vue'),
    meta: { layout: 'public' }
  },
  {
    path: '/gioi-thieu',
    name: 'AboutClinic',
    component: () => import('@/views/public/AboutClinic.vue'),
    meta: { layout: 'public' }
  },
  {
    path: '/dat-lich',
    name: 'PatientBooking',
    component: () => import('@/views/appointments/PatientBooking.vue'),
    meta: { layout: 'public' }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue')
  },
  {
    path: '/doctor/profile',
    name: 'DoctorProfile',
    component: () => import('../views/doctors/DoctorProfile.vue'),
    meta: { requiresDoctor: true, layout: 'doctor' }
  },
  {
    path: '/doctor/change-password',
    name: 'DoctorChangePassword',
    component: () => import('../views/doctors/DoctorChangePassword.vue'),
    meta: { requiresDoctor: true, layout: 'doctor' }
  },
  {
    path: '/doctor/medical-record',
    name: 'DoctorMedicalRecord',
    component: () => import('../views/doctors/DoctorMedicalRecord.vue'),
    meta: { requiresDoctor: true, layout: 'doctor' }
  },
  {
    path: '/doctor/medical-record-history',
    name: 'DoctorMedicalRecordHistory',
    component: () => import('../views/doctors/DoctorMedicalRecordHistory.vue'),
    meta: { requiresDoctor: true, layout: 'doctor' }
  },
  {
    path: '/doctor/medical-records/:id',
    name: 'DoctorMedicalRecordDetails',
    component: () => import('../views/medical-records/MedicalRecordDetails.vue'),
    meta: { requiresDoctor: true, layout: 'doctor' }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: HomeView,
    meta: { requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Bảo vệ route
router.beforeEach((to, from, next) => {
  const publicRoutes = ['/login', '/homepage', '/gioi-thieu', '/dat-lich'];
  const user = sessionStorage.getItem('doctorUser');
  const doctor = user ? JSON.parse(user) : null;
  if (!publicRoutes.includes(to.path)) {
    if (!doctor) {
      next('/login');
      return;
    }
  }
  if (to.meta.requiresAdmin) {
    if (!doctor || !doctor.isAdmin) {
      next('/login');
      return;
    }
  }
  if (to.meta.requiresDoctor) {
    if (!doctor) {
      next('/login');
      return;
    }
  }
  next();
});

export default router
