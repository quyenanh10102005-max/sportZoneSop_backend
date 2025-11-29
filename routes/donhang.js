const express = require('express');
const router = express.Router();
const DonHang = require('../models/DonHang');
const GioHang = require('../models/GioHang');
const SanPham = require('../models/SanPham');

//  Tạo đơn hàng mới
router.post('/', async (req, res) => {
  try {
    const {
      MaKhachHang,
      TenKhachHang,
      Email,
      SoDienThoai,
      DiaChiGiaoHang,
      Tinh,
      Quan,
      GhiChu,
      PhuongThucThanhToan,
      SanPham,
      TongTien,
      PhiVanChuyen
    } = req.body;

    console.log('📥 Nhận yêu cầu tạo đơn hàng:', {
      MaKhachHang,
      TenKhachHang,
      SoSanPham: SanPham?.length
    });

    // Validate dữ liệu
    if (!MaKhachHang || !TenKhachHang || !Email || !SoDienThoai || 
        !DiaChiGiaoHang || !Tinh || !Quan || !SanPham || SanPham.length === 0) {
      return res.status(400).json({ 
        message: 'Thiếu thông tin bắt buộc' 
      });
    }

    // Tạo đơn hàng
    const donHang = new DonHang({
      MaKhachHang,
      TenKhachHang,
      Email,
      SoDienThoai,
      DiaChiGiaoHang,
      Tinh,
      Quan,
      GhiChu: GhiChu || '',
      SanPham,
      TongTien,
      PhiVanChuyen: PhiVanChuyen || 30000,
      PhuongThucThanhToan: PhuongThucThanhToan || 'cod',
      TrangThaiThanhToan: PhuongThucThanhToan === 'cod' ? 'Chưa thanh toán' : 'Đã thanh toán',
      TrangThaiDonHang: 'Chờ xác nhận',
      NgayDat: new Date()
    });

    await donHang.save();

    console.log('✅ Đã tạo đơn hàng:', donHang._id);

    // Xóa giỏ hàng sau khi đặt hàng thành công
    await GioHang.deleteMany({ MaKhachHang });
    console.log('🗑️ Đã xóa giỏ hàng của khách hàng');

    res.status(201).json({ 
      message: 'Đặt hàng thành công',
      donHang: {
        _id: donHang._id,
        MaDonHang: donHang._id,
        TongTien: donHang.TongTien,
        TrangThaiDonHang: donHang.TrangThaiDonHang
      }
    });

  } catch (err) {
    console.error('❌ Lỗi tạo đơn hàng:', err);
    res.status(500).json({ 
      message: 'Lỗi khi tạo đơn hàng', 
      error: err.message 
    });
  }
});

//  Lấy đơn hàng theo khách hàng
router.get('/khachhang/:MaKhachHang', async (req, res) => {
  try {
    const donHangs = await DonHang.find({ 
      MaKhachHang: req.params.MaKhachHang 
    }).sort({ NgayDat: -1 });

    res.json(donHangs);
  } catch (err) {
    console.error('❌ Lỗi lấy đơn hàng:', err);
    res.status(500).json({ 
      message: 'Lỗi khi lấy đơn hàng', 
      error: err.message 
    });
  }
});

//  Lấy chi tiết đơn hàng
router.get('/:id', async (req, res) => {
  try {
    const donHang = await DonHang.findById(req.params.id)
      .populate('SanPham.MaSanPham');

    if (!donHang) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    res.json(donHang);
  } catch (err) {
    console.error('❌ Lỗi lấy chi tiết đơn hàng:', err);
    res.status(500).json({ 
      message: 'Lỗi khi lấy chi tiết đơn hàng', 
      error: err.message 
    });
  }
});

//  Cập nhật trạng thái đơn hàng
router.patch('/:id/status', async (req, res) => {
  try {
    const { TrangThaiDonHang, TrangThaiThanhToan } = req.body;
    
    const updateData = { NgayCapNhat: new Date() };
    if (TrangThaiDonHang) updateData.TrangThaiDonHang = TrangThaiDonHang;
    if (TrangThaiThanhToan) updateData.TrangThaiThanhToan = TrangThaiThanhToan;

    const donHang = await DonHang.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!donHang) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    res.json({ 
      message: 'Cập nhật trạng thái thành công', 
      donHang 
    });
  } catch (err) {
    console.error('❌ Lỗi cập nhật trạng thái:', err);
    res.status(500).json({ 
      message: 'Lỗi khi cập nhật trạng thái', 
      error: err.message 
    });
  }
});

module.exports = router;