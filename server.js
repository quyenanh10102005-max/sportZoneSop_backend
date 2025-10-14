const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const authRoutes = require('./routes/auth');
const connectDB = require('./db');

dotenv.config();

const app = express();
const cors = require('cors');

// Middleware
app.use(cors());
app.use(express.json());


app.use(express.static(path.join(__dirname, 'public')));

app.use('/ảnh', express.static(path.join(__dirname, 'public/ảnh')));


// Connect to Database
connectDB();

// Routes
app.use('/api/auth', authRoutes);

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