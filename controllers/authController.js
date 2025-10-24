const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'secret123key';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';

exports.register = async (req, res) => {
  try {
    const { TenDangNhap, MatKhau, Email, MaVaiTro } = req.body;
    
    if (!TenDangNhap || !MatKhau || !Email) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
    }

    // Kiểm tra tên đăng nhập đã tồn tại
    const existingUser = await User.findOne({ TenDangNhap });
    if (existingUser) {
      return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại' });
    }

    // Kiểm tra email đã tồn tại
    const existingEmail = await User.findOne({ Email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email đã được đăng ký' });
    }

    // Tạo user mới
    const newUser = new User({
      TenDangNhap,
      MatKhau,
      Email,
      MaVaiTro: MaVaiTro || 1
    });

    await newUser.save();

    return res.status(201).json({ message: 'Đăng ký thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { TenDangNhap, MatKhau } = req.body;
    
    if (!TenDangNhap || !MatKhau) {
      return res.status(400).json({ message: 'Vui lòng nhập tài khoản và mật khẩu' });
    }

    // Tìm user theo tên đăng nhập hoặc email
    const user = await User.findOne({
      $or: [{ TenDangNhap }, { Email: TenDangNhap }]
    });

    if (!user) {
      return res.status(400).json({ message: 'Sai tài khoản hoặc mật khẩu' });
    }

    // Kiểm tra mật khẩu
    const valid = await user.comparePassword(MatKhau);
    if (!valid) {
      return res.status(400).json({ message: 'Sai tài khoản hoặc mật khẩu' });
    }

    // Tạo JWT token
    const token = jwt.sign(
      { id: user._id, role: user.MaVaiTro }, 
      JWT_SECRET, 
      { expiresIn: JWT_EXPIRES }
    );

    return res.json({
      message: 'Đăng nhập thành công',
      token,
      user: {
        _id: user._id,
        TenDangNhap: user.TenDangNhap,
        Email: user.Email
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};