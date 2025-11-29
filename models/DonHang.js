const mongoose = require('mongoose');

const donHangSchema = new mongoose.Schema({
  MaKhachHang: { 
    type: String, 
    required: true 
  },
  TenKhachHang: { 
    type: String, 
    required: true 
  },
  Email: { 
    type: String, 
    required: true 
  },
  SoDienThoai: { 
    type: String, 
    required: true 
  },
  DiaChiGiaoHang: { 
    type: String, 
    required: true 
  },
  Tinh: { 
    type: String, 
    required: true 
  },
  Quan: { 
    type: String, 
    required: true 
  },
  GhiChu: { 
    type: String, 
    default: '' 
  },
  SanPham: [{
    MaSanPham: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'SanPham' 
    },
    TenSanPham: String,
    HinhAnh: String,
    Gia: Number,
    SoLuong: Number,
    Size: String,
    ThanhTien: Number
  }],
  TongTien: { 
    type: Number, 
    required: true 
  },
  PhiVanChuyen: { 
    type: Number, 
    default: 30000 
  },
  PhuongThucThanhToan: { 
    type: String, 
    enum: ['cod', 'bank', 'momo'],
    default: 'cod'
  },
  TrangThaiThanhToan: { 
    type: String, 
    enum: ['Chưa thanh toán', 'Đã thanh toán'],
    default: 'Chưa thanh toán'
  },
  TrangThaiDonHang: { 
    type: String, 
    enum: ['Chờ xác nhận', 'Đã xác nhận', 'Đang giao', 'Đã giao', 'Đã hủy'],
    default: 'Chờ xác nhận'
  },
  NgayDat: { 
    type: Date, 
    default: Date.now 
  },
  NgayCapNhat: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('DonHang', donHangSchema);