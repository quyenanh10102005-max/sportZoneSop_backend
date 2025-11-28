const express = require('express');
const router = express.Router();
const SanPham = require('../models/SanPham');

// =================== TÌM KIẾM VÀ LỌC SẢN PHẨM ===================
// GET /api/sanpham/search
// Query params supported:
// q, thuongHieu (comma separated), loai, size, minPrice, maxPrice, page, limit, sort
router.get('/search', async (req, res) => {
  try {
    const {
      q,
      thuongHieu,
      loai,
      size,
      minPrice,
      maxPrice,
      page = 1,
      limit = 24,
      sort
    } = req.query;

    const andClauses = [];

    // 1) Tìm kiếm toàn văn trên tên / mô tả / thương hiệu
    if (q) {
      const qRegex = { $regex: q, $options: 'i' };
      andClauses.push({
        $or: [
          { ten: qRegex },
          { moTa: qRegex },
          { thuongHieu: qRegex }
        ]
      });
    }

    // 2) Lọc theo thương hiệu (thuongHieu có thể là danh sách phân tách bởi dấu phẩy)
    if (thuongHieu) {
      const brands = thuongHieu.split(',').map(b => b.trim()).filter(Boolean);
      if (brands.length) {
        // Nếu model có field thuongHieu, dùng match trực tiếp để tận dụng index
        andClauses.push({ thuongHieu: { $in: brands } });
      }
    }

    // 3) Lọc theo loại (loai có thể là tên đầy đủ hoặc key -> chuyển sang tìm trong tên/mô tả)
    if (loai) {
      // Map từ loại sang các từ khóa có thể xuất hiện trong tên/mô tả
      const loaiKeywords = {
        'Sân cỏ nhân tạo': ['TF', 'turf', 'nhân tạo', 'AG', 'sân cỏ nhân tạo'],
        'Sân cỏ tự nhiên': ['FG', 'firm ground', 'tự nhiên', 'sân cỏ tự nhiên'],
        'Sân Futsal': ['IC', 'futsal', 'indoor', 'sân futsal'],
        'Khác': []
      };

      const keywords = loaiKeywords[loai] && loaiKeywords[loai].length
        ? loaiKeywords[loai]
        : [loai];

      // Tạo clause: (ten có keyword OR moTa có keyword) OR (loai chính xác nếu lưu ở model)
      const orForLoai = keywords.map(k => ({
        $or: [
          { ten: { $regex: k, $options: 'i' } },
          { moTa: { $regex: k, $options: 'i' } }
        ]
      }));

      if (orForLoai.length) {
        andClauses.push({ $or: orForLoai });
      }
    }

    // 4) Lọc theo kích cỡ (size) - nếu model lưu size là mảng string
    if (size) {
      // Hỗ trợ nhiều size phân tách bằng dấu phẩy
      const sizes = size.split(',').map(s => s.trim()).filter(Boolean);
      if (sizes.length) {
        andClauses.push({ size: { $in: sizes } });
      }
    }

    // 5) Lọc theo khoảng giá
    if (minPrice || maxPrice) {
      const giaClause = {};
      if (minPrice) giaClause.$gte = Number(minPrice);
      if (maxPrice) giaClause.$lte = Number(maxPrice);
      andClauses.push({ gia: giaClause });
    }

    // Kết hợp các điều kiện
    const finalQuery = andClauses.length ? { $and: andClauses } : {};

    // Phân trang & sắp xếp
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    let sortOption = { createdAt: -1 }; // default newest
    if (sort === 'price_asc') sortOption = { gia: 1 };
    else if (sort === 'price_desc') sortOption = { gia: -1 };
    else if (sort === 'newest') sortOption = { createdAt: -1 };

    // Lấy tổng và dữ liệu
    const [total, sanPhams] = await Promise.all([
      SanPham.countDocuments(finalQuery),
      SanPham.find(finalQuery)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
    ]);

    res.json({
      data: sanPhams,
      total,
      page: pageNum,
      limit: limitNum
    });
  } catch (err) {
    console.error('❌ Lỗi tìm kiếm/filter sản phẩm:', err);
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

//  Lấy danh sách sản phẩm (fallback, trả tất cả nếu cần)
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

module.exports = router;