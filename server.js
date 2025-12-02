require('dotenv').config();

const express = require('express');
const path = require('path');
const authRoutes = require('./routes/auth');
const connectDB = require('./db');
const sanPhamRoutes = require('./routes/sanpham');
const danhGiaRoutes = require('./routes/danhgia');
const gioHangRoutes = require('./routes/giohang');
const donHangRoutes = require('./routes/donhang'); 
const adminRoutes = require('./routes/admin');
const cors = require('cors');

console.log(' EMAIL CONFIG CHECK:');
console.log('  EMAIL_USER:', process.env.EMAIL_USER);
console.log('  EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? ' Set' : ' NOT SET');

const app = express();


const allowedOrigins = [
  'http://localhost:3000',
  'https://sportzoneshop.onrender.com'
];

app.use(cors({
  origin: function(origin, callback) {
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


app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Headers:', req.headers.authorization ? 'Token present' : 'No token');
  next();
});

// Connect  Database
connectDB();


app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/sanpham', sanPhamRoutes);
app.use('/api/danhgia', danhGiaRoutes);
app.use('/api/giohang', gioHangRoutes);
app.use('/api/donhang', donHangRoutes); 


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
    env: process.env.NODE_ENV || 'development',
    emailConfigured: !!process.env.EMAIL_USER
  });
});


app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ 
    message: 'Internal server error', 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(" Server đang chạy...");
  console.log(` PORT: ${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
});