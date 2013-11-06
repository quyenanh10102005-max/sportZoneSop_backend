const express = require('express');
const router = express.Router();
const SanPham = require('../models/SanPham');

//  Thêm sản phẩm mới
router.post('/', async (req, res) => {
  try {
    const sanPham = new SanPham(req.body);
    await sanPham.save();
    res.status(201).json({ message: 'Thêm sản phẩm thành công', sanPham });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//  Lấy danh sách sản phẩm
router.get('/', async (req, res) => {
  try {
    const sanPhams = await SanPham.find();
    res.json(sanPhams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//  Lấy chi tiết sản phẩm theo ID
router.get('/:id', async (req, res) => {
  try {
    const sanPham = await SanPham.findById(req.params.id);
    if (!sanPham) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
    res.json(sanPham);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cập nhật sản phẩm theo ID
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedSanPham = await SanPham.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedSanPham) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm để cập nhật' });
    }
    res.json({ message: 'Sản phẩm đã được cập nhật', sanPham: updatedSanPham });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


//  Xóa sản phẩm theo ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedSanPham = await SanPham.findByIdAndDelete(id);
    if (!deletedSanPham) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm để xóa' });
    }
    res.json({ message: 'Xóa sản phẩm thành công', sanPham: deletedSanPham });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


//Tìm kiếm
router.get('/search', async (req, res) => {
  try {
    const { q, thuongHieu, loai, minPrice, maxPrice } = req.query;
    
    let query = {};

    // Tìm kiếm theo tên
    if (q) {
      query.ten = { $regex: q, $options: 'i' }; // Không phân biệt hoa thường
    }

   
    if (thuongHieu) {
 
      query.ten = { $regex: thuongHieu, $options: 'i' };
    }

    
    if (loai) {
      const loaiKeywords = {
        'Sân cỏ nhân tạo': ['TF', 'turf', 'nhân tạo', 'AG'],
        'Sân cỏ tự nhiên': ['FG', 'firm ground', 'tự nhiên'],
        'Sân Futsal': ['IC', 'futsal', 'indoor']
      };
      
      const keywords = loaiKeywords[loai] || [loai];
      query.$or = keywords.map(keyword => ({
        $or: [
          { ten: { $regex: keyword, $options: 'i' } },
          { moTa: { $regex: keyword, $options: 'i' } }
        ]
      }));
    }

    // Lọc theo giá
    if (minPrice || maxPrice) {
      query.gia = {};
      if (minPrice) query.gia.$gte = Number(minPrice);
      if (maxPrice) query.gia.$lte = Number(maxPrice);
    }

    const sanPhams = await SanPham.find(query).sort({ createdAt: -1 });
    res.json(sanPhams);
  } catch (err) {
    console.error('❌ Lỗi tìm kiếm:', err);
    res.status(500).json({ error: err.message });
  }
});




module.exports = router;