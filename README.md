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
npm run install:all
```

3. Tạo file .env từ .env.example và cập nhật các biến môi trường

4. Khởi chạy ứng dụng:

Development mode:
```bash
# Chạy backend server
npm run dev:server

# Chạy frontend development server (trong terminal khác)
npm run dev:client
```

Production mode:
```bash
npm start
```

## Cấu trúc Project

```
patient-management-system/
├── client/                 # Vue.js frontend
├── server/                 # Node.js backend
│   ├── config/            # Cấu hình
│   ├── controllers/       # Xử lý logic
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   └── index.js          # Entry point
├── .env                   # Environment variables
├── .gitignore
└── package.json
``` 