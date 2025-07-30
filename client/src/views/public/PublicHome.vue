<template>
  <v-container class="d-flex flex-column align-center justify-center py-12">
    <v-img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80" max-width="600" class="mb-6 rounded-lg" alt="Phòng khám hiện đại" />
    <h1 class="text-h3 font-weight-bold mb-2 text-primary">Chào mừng đến với Phòng khám Đa khoa ABC</h1>
    <p class="text-subtitle-1 mb-4">Chăm sóc sức khỏe toàn diện cho bạn và gia đình với đội ngũ bác sĩ tận tâm, trang thiết bị hiện đại.</p>
    <v-btn color="primary" size="large" to="/dat-lich">Đặt lịch khám ngay</v-btn>

    <!-- Section: Lý do chọn phòng khám -->
    <v-row class="mt-8">
      <v-col cols="12" md="4" class="text-center">
        <v-icon size="48" color="primary">mdi-account-heart</v-icon>
        <h3 class="text-h6 font-weight-bold mt-2">Bác sĩ tận tâm</h3>
        <p>Đội ngũ bác sĩ nhiều năm kinh nghiệm, tư vấn tận tình.</p>
      </v-col>
      <v-col cols="12" md="4" class="text-center">
        <v-icon size="48" color="primary">mdi-hospital-building</v-icon>
        <h3 class="text-h6 font-weight-bold mt-2">Trang thiết bị hiện đại</h3>
        <p>Hệ thống máy móc, xét nghiệm, chẩn đoán hình ảnh tiên tiến.</p>
      </v-col>
      <v-col cols="12" md="4" class="text-center">
        <v-icon size="48" color="primary">mdi-calendar-check</v-icon>
        <h3 class="text-h6 font-weight-bold mt-2">Đặt lịch nhanh chóng</h3>
        <p>Đặt lịch online, xác nhận tự động, tiết kiệm thời gian chờ đợi.</p>
      </v-col>
    </v-row>

    <!-- Section: Quy trình đặt lịch khám -->
    <div style="width: 100vw; margin-left: calc(-50vw + 50%); margin-right: calc(-50vw + 50%); background: #f5f7fa; border-radius: 32px; padding: 64px 0; display: flex; align-items: center; justify-content: center; gap: 32px;">
      <v-img src="https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=1200&q=80" class="rounded-lg" max-width="420" max-height="280" style="box-shadow: 0 4px 24px #0001;" />
      <div style="text-align: center; max-width: 520px;">
        <h2 class="text-h4 font-weight-bold mb-6" style="color: #1976d2;">Quy trình đặt lịch khám</h2>
        <ol style="font-size: 1.35rem; text-align: left; max-width: 420px; margin: 0 auto; padding-left: 32px;">
          <li class="mb-3" style="display: flex; align-items: center; gap: 16px; min-height: 40px;">
            <span style="min-width: 32px; text-align: right; font-weight: bold; color: #1976d2;">1.</span>
            <span style="white-space: nowrap;">Chọn chuyên khoa/bác sĩ phù hợp</span>
          </li>
          <li class="mb-3" style="display: flex; align-items: center; gap: 16px; min-height: 40px;">
            <span style="min-width: 32px; text-align: right; font-weight: bold; color: #1976d2;">2.</span>
            <span style="white-space: nowrap;">Điền thông tin và chọn thời gian khám</span>
          </li>
          <li class="mb-3" style="display: flex; align-items: center; gap: 16px; min-height: 40px;">
            <span style="min-width: 32px; text-align: right; font-weight: bold; color: #1976d2;">3.</span>
            <span style="white-space: nowrap;">Xác nhận và nhận thông báo qua SMS/Email</span>
          </li>
          <li style="display: flex; align-items: center; gap: 16px; min-height: 40px;">
            <span style="min-width: 32px; text-align: right; font-weight: bold; color: #1976d2;">4.</span>
            <span style="white-space: nowrap;">Đến khám đúng giờ, không phải chờ đợi lâu</span>
          </li>
        </ol>
      </div>
    </div>
  </v-container>
</template>

<script setup>
// Trang tĩnh, không cần logic
</script> 