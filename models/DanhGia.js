const mongoose = require('mongoose');

const danhGiaSchema = new mongoose.Schema({
  MaDanhGia: { type: String, required: true },
  TieuDe: { type: String, required: true },
  NoiDung: { type: String, required: true },
  TrangThai: { type: Number, default: 1 },
  NgayTao: { type: Date, default: Date.now },
  MaSanPham: { type: String, required: true },
  MaThuongHieu: { type: String },
  MaKhachHang: { type: String },
  SoSao: { type: Number, min: 1, max: 5, required: true }
});

module.exports = mongoose.model('DanhGia', danhGiaSchema);