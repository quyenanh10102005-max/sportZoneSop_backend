const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const User = require('../models/User');
const SanPham = require('../models/SanPham');
const DonHang = require('../models/DonHang');
const GioHang = require('../models/GioHang');
const DanhGia = require('../models/DanhGia');

// MIDDLEWARE XÁC THỰC 
router.use((req, res, next) => {
  console.log(' Admin route accessed:', req.method, req.path);
  console.log(' Headers:', req.headers);
  next();
});

router.use(verifyToken);
router.use(isAdmin);

// THỐNG KÊ 
router.get('/stats', async (req, res) => {
  try {
    console.log(' Loading admin stats...');
    
    const totalUsers = await User.countDocuments();
    const totalProducts = await SanPham.countDocuments();
    const totalOrders = await DonHang.countDocuments();
    const totalCart = await GioHang.countDocuments();
    const totalReviews = await DanhGia.countDocuments();
    
    const totalRevenue = await DonHang.aggregate([
      { $group: { _id: null, total: { $sum: '$tongTien' } } }
    ]);

    const stats = {
      totalUsers,
      totalProducts,
      totalOrders,
      totalCart,
      totalReviews,
      totalRevenue: totalRevenue[0]?.total || 0
    };

    console.log(' Stats loaded:', stats);
    res.json(stats);
  } catch (err) {
    console.error(' Error loading stats:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// QUẢN LÝ NGƯỜI DÙNG 
router.get('/users', async (req, res) => {
  try {
    console.log(' Loading users...');
    const users = await User.find().select('-MatKhau').sort({ NgayTao: -1 });
    console.log(` Found ${users.length} users`);
    res.json(users);
  } catch (err) {
    console.error(' Error loading users:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

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

// =QUẢN LÝ SẢN PHẨM 
router.get('/sanpham', async (req, res) => {
  try {
    console.log(' Loading products...');
    const sanPhams = await SanPham.find().sort({ createdAt: -1 });
    console.log(` Found ${sanPhams.length} products`);
    res.json(sanPhams);
  } catch (err) {
    console.error(' Error loading products:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

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

router.post('/sanpham', async (req, res) => {
  try {
    const sanPham = new SanPham(req.body);
    await sanPham.save();
    res.status(201).json({ message: 'Thêm sản phẩm thành công', sanPham });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

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

//  QUẢN LÝ GIỎ HÀNG 
router.get('/giohang', async (req, res) => {
  try {
    console.log(' Loading carts...');
    const gioHangs = await GioHang.find()
      .populate('MaSanPham')
      .sort({ NgayTao: -1 });
    console.log(` Found ${gioHangs.length} cart items`);
    res.json(gioHangs);
  } catch (err) {
    console.error(' Error loading carts:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

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

//  QUẢN LÝ ĐỚN HÀNG 
router.get('/donhang', async (req, res) => {
  try {
    console.log(' Loading orders...');
    const donHangs = await DonHang.find().sort({ ngayDat: -1 });
    console.log(` Found ${donHangs.length} orders`);
    res.json(donHangs);
  } catch (err) {
    console.error(' Error loading orders:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

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

// QUẢN LÝ ĐÁNH GIÁ 
router.get('/danhgia', async (req, res) => {
  try {
    console.log(' Loading reviews...');
    const danhGias = await DanhGia.find().sort({ NgayTao: -1 });
    console.log(` Found ${danhGias.length} reviews`);
    res.json(danhGias);
  } catch (err) {
    console.error(' Error loading reviews:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

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

router.use((err, req, res, next) => {
  console.error(' Admin route error:', err);
  res.status(500).json({ 
    message: 'Lỗi server', 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

module.exports = router;