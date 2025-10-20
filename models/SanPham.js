const mongoose = require('mongoose');

const sanPhamSchema = new mongoose.Schema({
  ten: String,
  gia: Number,
  soLuong: Number,
  moTa: String,
  hinhAnh: String 
});

module.exports = mongoose.model('SanPham', sanPhamSchema);