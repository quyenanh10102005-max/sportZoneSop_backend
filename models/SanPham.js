const mongoose = require('mongoose');

const sanPhamSchema = new mongoose.Schema({
  ten: { 
    type: String, 
    required: true,
    trim: true 
  },
  gia: { 
    type: Number, 
    required: true,
    min: 0 
  },
  soLuong: { 
    type: Number, 
    default: 0,
    min: 0 
  },
  moTa: { 
    type: String,
    default: '' 
  },
  hinhAnh: { 
    type: String,
    default: '/images/default.jpg' 
  },
  thuongHieu: { 
    type: String,
    enum: ['Nike', 'Adidas', 'Puma', 'Mizuno', 'Kamito', 'Zocker', 'Khác'],
    default: 'Khác',
    index: true 
  },
  loai: {
    type: String,
    enum: ['Sân cỏ nhân tạo', 'Sân cỏ tự nhiên', 'Sân Futsal', 'Khác'],
    default: 'Khác'
  },
  size: [String] 
}, {
  timestamps: true 
});

module.exports = mongoose.model('SanPham', sanPhamSchema);