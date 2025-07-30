# Hệ thống Quản lý Bệnh nhân

Hệ thống quản lý bệnh nhân cho phòng khám sử dụng MEVN Stack (MongoDB, Express.js, Vue.js, Node.js)

## Tính năng

- Quản lý thông tin bệnh nhân
- Đặt lịch hẹn khám
- Quản lý hồ sơ bệnh án
- Kê đơn thuốc
- Quản lý lịch làm việc bác sĩ
- Báo cáo và thống kê

## Yêu cầu hệ thống

- Node.js (v14 trở lên)
- MongoDB
- Vue CLI

## Cài đặt

1. Clone repository:
```bash
git clone <repository-url>
cd patient-management-system
```

2. Cài đặt dependencies:
```bash
npm run install-all
```

3. Cấu hình môi trường:
   - Tạo file `.env` trong thư mục `server/` với nội dung:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/patient-management
JWT_SECRET=your-secret-key
```

4. Khởi động MongoDB:
```bash
# Đảm bảo MongoDB đang chạy trên localhost:27017
```

5. Khởi chạy ứng dụng:

Development mode:
```bash
# Chạy toàn bộ ứng dụng (cả frontend và backend)
npm start

# Hoặc chạy riêng lẻ:
# Backend server (trong thư mục server/)
cd server && npm run dev

# Frontend development server (trong thư mục client/)
cd client && npm run dev
```

Production mode:
```bash
# Build frontend
cd client && npm run build

# Chạy backend
cd server && npm start
```

## Truy cập ứng dụng

- Frontend: http://localhost:5173 (Vite dev server)
- Backend API: http://localhost:3000

## Cấu trúc Project

```
patient-management-system/
├── client/                 # Vue.js frontend
│   ├── src/
│   │   ├── components/    # Vue components
│   │   ├── views/         # Vue pages
│   │   ├── router/        # Vue Router
│   │   ├── store/         # Vuex store
│   │   └── plugins/       # Vuetify & API plugins
│   └── package.json
├── server/                 # Node.js backend
│   ├── config/            # Cấu hình database
│   ├── controllers/       # Xử lý logic
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── uploads/          # File uploads
│   └── index.js          # Entry point
├── .env                   # Environment variables (tạo trong server/)
├── .gitignore
└── package.json
``` 