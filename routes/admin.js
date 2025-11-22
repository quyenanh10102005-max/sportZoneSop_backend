const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const User = require('../models/User');
const SanPham = require('../models/SanPham');
const DonHang = require('../models/DonHang');
const GioHang = require('../models/GioHang');
const DanhGia = require('../models/DanhGia');

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
// Lấy tất cả sản phẩm
router.get('/sanpham', async (req, res) => {
  try {
    const sanPhams = await SanPham.find().sort({ createdAt: -1 });
    res.json(sanPhams);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// Lấy chi tiết 1 sản phẩm
router.get('/sanpham/:id', async (req, res) => {
  try {
    const sanPham = await SanPham.findById(req.params.id);
    if (!sanPham) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
    res.json(sanPham);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

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

// ============= QUẢN LÝ GIỎ HÀNG =============
// Lấy tất cả giỏ hàng
router.get('/giohang', async (req, res) => {
  try {
    const gioHangs = await GioHang.find()
      .populate('MaSanPham')
      .sort({ NgayTao: -1 });
    res.json(gioHangs);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// Xóa giỏ hàng
router.delete('/giohang/:id', async (req, res) => {
  try {
    const gioHang = await GioHang.findByIdAndDelete(req.params.id);
    if (!gioHang) {
      return res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });
    }
    res.json({ message: 'Xóa giỏ hàng thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// ============= QUẢN LÝ ĐƠN HÀNG =============
// Lấy tất cả đơn hàng
router.get('/donhang', async (req, res) => {
  try {
    const donHangs = await DonHang.find().sort({ ngayDat: -1 });
    res.json(donHangs);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// Lấy chi tiết đơn hàng
router.get('/donhang/:id', async (req, res) => {
  try {
    const donHang = await DonHang.findById(req.params.id);
    if (!donHang) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
    res.json(donHang);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// Xóa đơn hàng
router.delete('/donhang/:id', async (req, res) => {
  try {
    const donHang = await DonHang.findByIdAndDelete(req.params.id);
    if (!donHang) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
    res.json({ message: 'Xóa đơn hàng thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// ============= QUẢN LÝ ĐÁNH GIÁ =============
// Lấy tất cả đánh giá
router.get('/danhgia', async (req, res) => {
  try {
    const danhGias = await DanhGia.find().sort({ NgayTao: -1 });
    res.json(danhGias);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// Xóa đánh giá
router.delete('/danhgia/:id', async (req, res) => {
  try {
    const danhGia = await DanhGia.findByIdAndDelete(req.params.id);
    if (!danhGia) {
      return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
    }
    res.json({ message: 'Xóa đánh giá thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// Cập nhật trạng thái đánh giá
router.patch('/danhgia/:id/status', async (req, res) => {
  try {
    const { TrangThai } = req.body;
    const danhGia = await DanhGia.findByIdAndUpdate(
      req.params.id,
      { TrangThai },
      { new: true }
    );
    
    if (!danhGia) {
      return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
    }
    res.json({ message: 'Cập nhật trạng thái thành công', danhGia });
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
    const totalCart = await GioHang.countDocuments();
    const totalReviews = await DanhGia.countDocuments();
    
    const totalRevenue = await DonHang.aggregate([
      { $group: { _id: null, total: { $sum: '$tongTien' } } }
    ]);

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalCart,
      totalReviews,
      totalRevenue: totalRevenue[0]?.total || 0
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

module.exports = router;