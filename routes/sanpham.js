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

// 🟣 Cập nhật sản phẩm theo ID
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

module.exports = router;