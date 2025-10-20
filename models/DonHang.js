const mongoose = require('mongoose');

const donHangSchema = new mongoose.Schema({
  khachHang: String,
  ngayDat: Date,
  tongTien: Number,
});

module.exports = mongoose.model('DonHang', donHangSchema);