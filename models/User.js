const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  TenDangNhap: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  Email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  MatKhau: {
    type: String,
    required: true
  },
  MaVaiTro: {
    type: Number,
    default: 1
  },
  NgayTao: {
    type: Date,
    default: Date.now
  },
  
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationCode: {
    type: String,
    default: null
  },
  verificationCodeExpires: {
    type: Date,
    default: null
  },
  //  Field đặt lại mật khẩu
  resetPasswordCode: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  }
});

// Hash password trước khi lưu
userSchema.pre('save', async function(next) {
  if (!this.isModified('MatKhau')) return next();
  
  try {
    const hashed = await bcrypt.hash(this.MatKhau, 10);
    this.MatKhau = hashed;
    next();
  } catch (err) {
    next(err);
  }
});

//  so sánh password
userSchema.methods.comparePassword = async function(MatKhau) {
  return await bcrypt.compare(MatKhau, this.MatKhau);
};

module.exports = mongoose.model('TaiKhoan', userSchema);