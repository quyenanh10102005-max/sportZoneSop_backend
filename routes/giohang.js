const express = require('express');
const router = express.Router();
const GioHang = require('../models/GioHang');
const mongoose = require('mongoose');

// Thêm vào giỏ hàng
router.post('/', async (req, res) => {
  try {
    const { MaKhachHang, MaSanPham, SoLuong, Size } = req.body;

    // Validate dữ liệu đầu vào
    if (!MaKhachHang || !MaSanPham || !SoLuong || !Size) {
      return res.status(400).json({ 
        error: 'Thiếu thông tin bắt buộc',
        details: 'Cần có MaKhachHang, MaSanPham, SoLuong và Size'
      });
    }

    // Validate ObjectId cho MaSanPham
    if (!mongoose.Types.ObjectId.isValid(MaSanPham)) {
      return res.status(400).json({ error: 'MaSanPham không hợp lệ' });
    }

    // Kiểm tra nếu sản phẩm đã có trong giỏ => cập nhật số lượng
    let item = await GioHang.findOne({ MaKhachHang, MaSanPham, Size });

    if (item) {
      item.SoLuong += parseInt(SoLuong);
      item.NgayCapNhat = new Date();
      await item.save();
      return res.json({ message: 'Cập nhật số lượng giỏ hàng thành công', item });
    }

    // Tạo mới
    const newItem = new GioHang({ 
      MaKhachHang, 
      MaSanPham, 
      SoLuong: parseInt(SoLuong), 
      Size 
    });
    await newItem.save();
    
    res.json({ message: 'Đã thêm vào giỏ hàng', item: newItem });

  } catch (error) {
    console.error('Lỗi POST /api/giohang:', error);
    res.status(500).json({ 
      error: 'Lỗi khi thêm giỏ hàng', 
      details: error.message 
    });
  }
});

// Route mặc định - yêu cầu MaKhachHang
router.get('/', async (req, res) => {
  res.status(400).json({ 
    error: 'Thiếu MaKhachHang',
    message: 'Vui lòng sử dụng GET /api/giohang/:MaKhachHang'
  });
});

// Lấy giỏ hàng theo khách hàng
router.get('/:MaKhachHang', async (req, res) => {
  try {
    const { MaKhachHang } = req.params;

    // Validate
    if (!MaKhachHang || MaKhachHang === 'undefined' || MaKhachHang === 'null') {
      return res.status(400).json({ 
        error: 'MaKhachHang không hợp lệ',
        received: MaKhachHang
      });
    }

    console.log('Lấy giỏ hàng cho khách hàng:', MaKhachHang);

    const gioHang = await GioHang.find({ MaKhachHang })
      .populate('MaSanPham')
      .sort({ NgayTao: -1 });

    console.log('Số sản phẩm trong giỏ:', gioHang.length);

    // Lọc bỏ những item có sản phẩm đã bị xóa
    const validCart = gioHang.filter(item => item.MaSanPham !== null);

    res.json(validCart);

  } catch (error) {
    console.error('Lỗi GET /api/giohang:', error);
    res.status(500).json({ 
      error: 'Lỗi khi lấy giỏ hàng',
      details: error.message 
    });
  }
});

// Cập nhật số lượng sản phẩm trong giỏ
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { SoLuong } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID không hợp lệ' });
    }

    if (!SoLuong || SoLuong < 1) {
      return res.status(400).json({ error: 'Số lượng phải lớn hơn 0' });
    }

    const item = await GioHang.findByIdAndUpdate(
      id,
      { SoLuong: parseInt(SoLuong), NgayCapNhat: new Date() },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm trong giỏ hàng' });
    }

    res.json({ message: 'Cập nhật số lượng thành công', item });

  } catch (error) {
    console.error('Lỗi PUT /api/giohang:', error);
    res.status(500).json({ 
      error: 'Lỗi khi cập nhật số lượng',
      details: error.message 
    });
  }
});

// Xóa 1 sản phẩm trong giỏ
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID không hợp lệ' });
    }

    const deletedItem = await GioHang.findByIdAndDelete(id);

    if (!deletedItem) {
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm trong giỏ hàng' });
    }

    res.json({ message: 'Đã xóa sản phẩm khỏi giỏ hàng' });

  } catch (error) {
    console.error('Lỗi DELETE /api/giohang:', error);
    res.status(500).json({ 
      error: 'Lỗi khi xóa sản phẩm',
      details: error.message 
    });
  }
});

// Xóa toàn bộ giỏ hàng của khách hàng
router.delete('/clear/:MaKhachHang', async (req, res) => {
  try {
    const { MaKhachHang } = req.params;

    const result = await GioHang.deleteMany({ MaKhachHang });

    res.json({ 
      message: 'Đã xóa toàn bộ giỏ hàng',
      deletedCount: result.deletedCount 
    });

  } catch (error) {
    console.error('Lỗi DELETE /api/giohang/clear:', error);
    res.status(500).json({ 
      error: 'Lỗi khi xóa giỏ hàng',
      details: error.message 
    });
  }
});

module.exports = router;