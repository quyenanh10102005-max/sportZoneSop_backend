const express = require('express');
const router = express.Router();
const SanPham = require('../models/SanPham');

//  Tìm kiếm và lọc sản phẩm
router.get('/search', async (req, res) => {
  try {
    const { q, thuongHieu, loai, minPrice, maxPrice } = req.query;
    
    let query = {};
    let andConditions = [];

    //  Tìm kiếm theo TÊN sản phẩm
    if (q) {
      andConditions.push({
        ten: { $regex: q, $options: 'i' }
      });
    }

    // 🏷️ Lọc theo THƯƠNG HIỆU (hỗ trợ nhiều thương hiệu)
    if (thuongHieu) {
      const brands = thuongHieu.split(',').map(b => b.trim());
      andConditions.push({
        thuongHieu: { $in: brands }
      });
    }

    //  Lọc theo LOẠI sân
    if (loai) {
      const types = loai.split(',').map(t => t.trim());
      andConditions.push({
        loai: { $in: types }
      });
    }

    // 💰 Lọc theo GIÁ
    if (minPrice || maxPrice) {
      let priceCondition = {};
      if (minPrice) priceCondition.$gte = Number(minPrice);
      if (maxPrice) priceCondition.$lte = Number(maxPrice);
      andConditions.push({ gia: priceCondition });
    }

    // Kết hợp tất cả điều kiện
    if (andConditions.length > 0) {
      query.$and = andConditions;
    }

    console.log('🔍 Search query:', JSON.stringify(query, null, 2));
    
    const sanPhams = await SanPham.find(query).sort({ createdAt: -1 });
    
    console.log(`✅ Tìm thấy ${sanPhams.length} sản phẩm`);
    
    res.json(sanPhams);
  } catch (err) {
    console.error('❌ Lỗi tìm kiếm:', err);
    res.status(500).json({ error: err.message });
  }
});

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

//  Lấy TOÀN BỘ danh sách sản phẩm (không lọc)
router.get('/', async (req, res) => {
  try {
    const sanPhams = await SanPham.find().sort({ createdAt: -1 });
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

module.exports = router;