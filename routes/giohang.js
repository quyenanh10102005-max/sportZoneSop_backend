const express = require('express');
const router = express.Router();
const GioHang = require('../models/GioHang');

// Thêm vào giỏ hàng
router.post('/', async (req, res) => {
  try {
    const { MaKhachHang, MaSanPham, SoLuong, Size } = req.body;

    // Kiểm tra nếu sản phẩm đã có trong giỏ => cập nhật số lượng
    let item = await GioHang.findOne({ MaKhachHang, MaSanPham, Size });

    if (item) {
      item.SoLuong += SoLuong;
      item.NgayCapNhat = new Date();
      await item.save();
      return res.json({ message: 'Cập nhật số lượng giỏ hàng', item });
    }

    const newItem = new GioHang({ MaKhachHang, MaSanPham, SoLuong, Size });
    await newItem.save();
    res.json({ message: 'Đã thêm vào giỏ hàng', item: newItem });

  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi thêm giỏ hàng', details: error.message });
  }
});

// Lấy giỏ hàng theo khách hàng
router.get('/:MaKhachHang', async (req, res) => {
  try {
    const gioHang = await GioHang.find({ MaKhachHang: req.params.MaKhachHang })
      .populate('MaSanPham');
    res.json(gioHang);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi lấy giỏ hàng' });
  }
});

// Xóa 1 sản phẩm trong giỏ
router.delete('/:id', async (req, res) => {
  try {
    await GioHang.findByIdAndDelete(req.params.id);
    res.json({ message: 'Đã xóa sản phẩm khỏi giỏ hàng' });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi xóa sản phẩm' });
  }
});

module.exports = router;