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

module.exports = router;