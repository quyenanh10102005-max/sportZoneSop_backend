const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const danhGiaSchema = new mongoose.Schema({
  MaDanhGia: String,
  TieuDe: String,
  NoiDung: String,
  TrangThai: Number,
  NgayTao: Date,
  MaSanPham: String,
  MaThuongHieu: String,
  MaKhachHang: String,
  SoSao: Number
});

const DanhGia = mongoose.model('DanhGia', danhGiaSchema);

//  Thêm đánh giá mới
router.post('/', async (req, res) => {
  try {
    const dg = new DanhGia(req.body);
    await dg.save();
    res.status(201).json({ message: 'Đã thêm đánh giá', danhGia: dg });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Lấy danh sách đánh giá theo sản phẩm
router.get('/:MaSanPham', async (req, res) => {
  try {
    const ds = await DanhGia.find({ MaSanPham: req.params.MaSanPham });
    res.json(ds);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;