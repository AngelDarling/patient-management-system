import { createStore } from 'vuex'
import axios from 'axios'

const API_URL = '/api'

export default createStore({
  state: {
    patients: [],
    doctors: [],
    appointments: [],
    medicalRecords: [],
    loading: false,
    error: null
  },
  mutations: {
    SET_LOADING (state, loading) {
      state.loading = loading
    },
    SET_ERROR (state, error) {
      state.error = error
    },
    SET_PATIENTS (state, patients) {
      state.patients = patients
    },
    SET_DOCTORS (state, doctors) {
      state.doctors = doctors
    },
    SET_APPOINTMENTS (state, appointments) {
      state.appointments = appointments
    },
    SET_MEDICAL_RECORDS (state, records) {
      state.medicalRecords = records
    }
  },
  actions: {
    // Patients
    async fetchPatients ({ commit }) {
      try {
        commit('SET_LOADING', true)
        const response = await axios.get(`${API_URL}/patients`)
        commit('SET_PATIENTS', response.data)
      } catch (error) {
        commit('SET_ERROR', error.message)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async createPatient ({ commit }, patientData) {
      try {
        commit('SET_LOADING', true)
        const response = await axios.post(`${API_URL}/patients`, patientData)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async updatePatient ({ commit }, { id, data }) {
      try {
        commit('SET_LOADING', true)
        const response = await axios.put(`${API_URL}/patients/${id}`, data)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async deletePatient ({ commit }, id) {
      try {
        commit('SET_LOADING', true)
        await axios.delete(`${API_URL}/patients/${id}`)
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    // Doctors
    async fetchDoctors ({ commit }) {
      try {
        commit('SET_LOADING', true)
        const response = await axios.get(`${API_URL}/doctors`)
        commit('SET_DOCTORS', response.data)
      } catch (error) {
        commit('SET_ERROR', error.message)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async getDoctor ({ commit }, id) {
      try {
        commit('SET_LOADING', true)
        const response = await axios.get(`${API_URL}/doctors/${id}`)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async createDoctor ({ commit }, doctorData) {
      try {
        commit('SET_LOADING', true)
        const response = await axios.post(`${API_URL}/doctors`, doctorData)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async updateDoctor ({ commit }, { id, data }) {
      try {
        commit('SET_LOADING', true)
        const response = await axios.put(`${API_URL}/doctors/${id}`, data)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async deleteDoctor ({ commit }, id) {
      try {
        commit('SET_LOADING', true)
        await axios.delete(`${API_URL}/doctors/${id}`)
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async updateDoctorSchedule ({ commit }, { id, schedule }) {
      try {
        commit('SET_LOADING', true)
        const response = await axios.put(`${API_URL}/doctors/${id}/schedule`, { schedule })
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async getDoctorAppointments ({ commit }, id) {
      try {
        commit('SET_LOADING', true)
        const response = await axios.get(`${API_URL}/doctors/${id}/appointments`)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async resetDoctorPassword({ commit }, { id, password }) {
      try {
        commit('SET_LOADING', true)
        await axios.post(`${API_URL}/doctors/${id}/change-password`, { newPassword: password, oldPassword: null })
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    // Appointments
    async fetchAppointments ({ commit }) {
      try {
        commit('SET_LOADING', true)
        const response = await axios.get(`${API_URL}/appointments`)
        commit('SET_APPOINTMENTS', response.data)
      } catch (error) {
        commit('SET_ERROR', error.message)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async getAppointment ({ commit }, id) {
      try {
        commit('SET_LOADING', true)
        const response = await axios.get(`${API_URL}/appointments/${id}`)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async createAppointment ({ commit }, appointmentData) {
      try {
        commit('SET_LOADING', true)
        const response = await axios.post(`${API_URL}/appointments`, appointmentData)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async updateAppointment ({ commit }, { id, data }) {
      try {
        commit('SET_LOADING', true)
        const response = await axios.put(`${API_URL}/appointments/${id}`, data)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async deleteAppointment ({ commit }, id) {
      try {
        commit('SET_LOADING', true)
        await axios.delete(`${API_URL}/appointments/${id}`)
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async fetchAppointmentsByPatient({ commit }, patientId) {
      try {
        commit('SET_LOADING', true)
        const response = await axios.get(`${API_URL}/appointments?patient=${patientId}`)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async fetchAppointmentsByPatientAndDoctor({ commit }, { patientId, doctorId }) {
      try {
        commit('SET_LOADING', true)
        const response = await axios.get(`${API_URL}/appointments?patient=${patientId}&doctor=${doctorId}`)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    // Medical Records
    async fetchMedicalRecords ({ commit }) {
      try {
        commit('SET_LOADING', true)
        const response = await axios.get(`${API_URL}/medical-records`)
        commit('SET_MEDICAL_RECORDS', response.data)
      } catch (error) {
        commit('SET_ERROR', error.message)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async getMedicalRecord ({ commit }, id) {
      try {
        commit('SET_LOADING', true)
        const response = await axios.get(`${API_URL}/medical-records/${id}`)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async createMedicalRecord ({ commit }, recordData) {
      try {
        commit('SET_LOADING', true)
        const response = await axios.post(`${API_URL}/medical-records`, recordData)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async updateMedicalRecord ({ commit }, { id, data }) {
      try {
        commit('SET_LOADING', true)
        const response = await axios.put(`${API_URL}/medical-records/${id}`, data)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async deleteMedicalRecord ({ commit }, id) {
      try {
        commit('SET_LOADING', true)
        await axios.delete(`${API_URL}/medical-records/${id}`)
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async uploadAttachment ({ commit }, { recordId, file }) {
      try {
        commit('SET_LOADING', true)
        const formData = new FormData()
        formData.append('file', file)
        const response = await axios.post(
          `${API_URL}/medical-records/${recordId}/attachments`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        )
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async downloadAttachment ({ commit }, { recordId, attachmentId }) {
      try {
        commit('SET_LOADING', true)
        const response = await axios.get(
          `${API_URL}/medical-records/${recordId}/attachments/${attachmentId}`,
          { responseType: 'blob' }
        )
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'attachment')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async addMedicalHistory({ commit }, { id, data }) {
      try {
        commit('SET_LOADING', true)
        const response = await axios.post(`${API_URL}/medical-records/${id}/history`, data)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async deleteAttachment({ commit }, { recordId, attachmentId }) {
      try {
        commit('SET_LOADING', true)
        await axios.delete(`${API_URL}/medical-records/${recordId}/attachments/${attachmentId}`)
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    }
  },
  getters: {
    isLoading: state => state.loading,
    error: state => state.error,
    patients: state => state.patients,
    doctors: state => state.doctors,
    appointments: state => state.appointments,
    medicalRecords: state => state.medicalRecords
  }
})
