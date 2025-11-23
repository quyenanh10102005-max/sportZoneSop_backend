const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const authRoutes = require('./routes/auth');
const connectDB = require('./db');
const sanPhamRoutes = require('./routes/sanpham');
const danhGiaRoutes = require('./routes/danhgia');
const gioHangRoutes = require('./routes/giohang');
const adminRoutes = require('./routes/admin');

dotenv.config();

const app = express();
const cors = require('cors');

// ========== CORS FIX ==========
const allowedOrigins = [
  'http://localhost:3000',
  'https://sportzonesop.onrender.com'
];

app.use(cors({
  origin: function(origin, callback) {
    // Cho phép requests không có origin (mobile apps, postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// ========== LOGGING MIDDLEWARE ==========
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Headers:', req.headers.authorization ? 'Token present' : 'No token');
  next();
});

// Connect to Database
connectDB();

// ========== API ROUTES ==========
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/sanpham', sanPhamRoutes);
app.use('/api/danhgia', danhGiaRoutes);
app.use('/api/giohang', gioHangRoutes);

// Serve HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Trang_chu.html'));
});

app.get('/dang-ky', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Dang_ky.html'));
});

app.get('/dang-nhap', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Dang_nhap.html'));
});

app.get('/gio-hang', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Gio_hang.html'));
});

app.get('/admin-login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Admin_Login.html'));
});

app.get('/admin-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Admin_Dashboard.html'));
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    env: process.env.NODE_ENV || 'development'
  });
});

// ========== ERROR HANDLING ==========
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ 
    message: 'Internal server error', 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("✅ Server đang chạy...");
  console.log(`✅ PORT: ${PORT}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
});