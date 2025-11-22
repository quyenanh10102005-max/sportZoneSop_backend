const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const User = require('../models/User');
const SanPham = require('../models/SanPham');
const DonHang = require('../models/DonHang');

// Tất cả routes admin đều cần xác thực và kiểm tra quyền admin
router.use(verifyToken, isAdmin);

// ============= QUẢN LÝ NGƯỜI DÙNG =============
// Lấy danh sách tất cả người dùng
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-MatKhau').sort({ NgayTao: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// Xóa người dùng
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    res.json({ message: 'Xóa người dùng thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// Cập nhật vai trò người dùng
router.patch('/users/:id/role', async (req, res) => {
  try {
    const { MaVaiTro } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { MaVaiTro },
      { new: true }
    ).select('-MatKhau');
    
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// ============= QUẢN LÝ SẢN PHẨM =============
// Thêm sản phẩm mới
router.post('/sanpham', async (req, res) => {
  try {
    const sanPham = new SanPham(req.body);
    await sanPham.save();
    res.status(201).json({ message: 'Thêm sản phẩm thành công', sanPham });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// Cập nhật sản phẩm
router.put('/sanpham/:id', async (req, res) => {
  try {
    const sanPham = await SanPham.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!sanPham) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
    res.json({ message: 'Cập nhật sản phẩm thành công', sanPham });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// Xóa sản phẩm
router.delete('/sanpham/:id', async (req, res) => {
  try {
    const sanPham = await SanPham.findByIdAndDelete(req.params.id);
    if (!sanPham) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
    res.json({ message: 'Xóa sản phẩm thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// ============= THỐNG KÊ =============
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await SanPham.countDocuments();
    const totalOrders = await DonHang.countDocuments();
    const totalRevenue = await DonHang.aggregate([
      { $group: { _id: null, total: { $sum: '$TongTien' } } }
    ]);

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

module.exports = router;