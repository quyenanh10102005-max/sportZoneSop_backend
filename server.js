const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const authRoutes = require('./routes/auth');
const connectDB = require('./db');
const sanPhamRoutes = require('./routes/sanpham');

dotenv.config();

const app = express();
const cors = require('cors');

// Middleware
app.use(cors());
app.use(express.json());


app.use(express.static(path.join(__dirname, 'public')));

app.use('/images', express.static(path.join(__dirname, 'public/images')));


// Connect to Database
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sanpham', sanPhamRoutes)



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

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});