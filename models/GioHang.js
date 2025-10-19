const mongoose = require('mongoose');

const gioHangSchema = new mongoose.Schema({
  MaKhachHang: { type: String, required: true },
  MaSanPham: { type: mongoose.Schema.Types.ObjectId, ref: 'SanPham', required: true },
  SoLuong: { type: Number, default: 1 },
  Size: { type: String },
  NgayTao: { type: Date, default: Date.now },
  NgayCapNhat: { type: Date, default: Date.now }
});

module.exports = mongoose.model('GioHang', gioHangSchema);