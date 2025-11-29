const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../config/emailConfig');

//  Hàm tạo mã xác thực 6 số
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ======================= ĐĂNG KÝ - BƯỚC 1: GỬI MÃ XÁC THỰC =======================
exports.sendVerificationCode = async (req, res) => {
  try {
    const { Email, TenDangNhap } = req.body;

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ $or: [{ Email }, { TenDangNhap }] });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'Email hoặc tên đăng nhập đã được sử dụng!' 
      });
    }

    // Tạo mã xác thực
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 phút

    // Lưu tạm thông tin vào session hoặc cache (ở đây dùng temporary user)
    const tempUser = new User({
      TenDangNhap,
      Email,
      MatKhau: 'temp_password', // Sẽ được thay thế sau
      verificationCode,
      verificationCodeExpires: expiresAt,
      isVerified: false
    });

    await tempUser.save();

    // Gửi email
    await sendVerificationEmail(Email, verificationCode, TenDangNhap);

    res.json({ 
      message: 'Mã xác thực đã được gửi đến email của bạn!',
      email: Email,
      expiresIn: 600 // 10 phút (giây)
    });

  } catch (error) {
    console.error('❌ Lỗi gửi mã xác thực:', error);
    res.status(500).json({ 
      message: 'Không thể gửi mã xác thực. Vui lòng thử lại!' 
    });
  }
};

// ======================= ĐĂNG KÝ - BƯỚC 2: XÁC THỰC VÀ HOÀN TẤT =======================
exports.verifyAndRegister = async (req, res) => {
  try {
    const { Email, verificationCode, MatKhau } = req.body;

    // Tìm user chưa xác thực
    const user = await User.findOne({ 
      Email, 
      verificationCode,
      isVerified: false
    });

    if (!user) {
      return res.status(400).json({ 
        message: 'Mã xác thực không đúng!' 
      });
    }

    // Kiểm tra mã đã hết hạn chưa
    if (user.verificationCodeExpires < new Date()) {
      await User.deleteOne({ _id: user._id }); // Xóa user tạm
      return res.status(400).json({ 
        message: 'Mã xác thực đã hết hạn. Vui lòng đăng ký lại!' 
      });
    }

    // Cập nhật mật khẩu và xác thực
    user.MatKhau = MatKhau;
    user.isVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpires = null;
    
    await user.save();

    // Tạo JWT token
    const token = jwt.sign(
      { 
        MaTK: user._id, 
        TenDangNhap: user.TenDangNhap,
        MaVaiTro: user.MaVaiTro 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Đăng ký thành công!',
      token,
      user: {
        MaTK: user._id,
        TenDangNhap: user.TenDangNhap,
        Email: user.Email,
        MaVaiTro: user.MaVaiTro
      }
    });

  } catch (error) {
    console.error('❌ Lỗi xác thực:', error);
    res.status(500).json({ 
      message: 'Đăng ký thất bại. Vui lòng thử lại!' 
    });
  }
};

// ======================= ĐĂNG NHẬP =======================
exports.login = async (req, res) => {
  try {
    const { TenDangNhap, MatKhau } = req.body;

    const user = await User.findOne({ 
      $or: [
        { TenDangNhap }, 
        { Email: TenDangNhap }
      ]
    });

    if (!user) {
      return res.status(401).json({ 
        message: 'Tên đăng nhập hoặc mật khẩu không đúng!' 
      });
    }

    // Kiểm tra đã xác thực email chưa
    if (user.MaVaiTro === 1 && !user.isVerified) {
      return res.status(401).json({ 
        message: 'Tài khoản chưa được xác thực. Vui lòng kiểm tra email!' 
      });
    }

    const isMatch = await user.comparePassword(MatKhau);
    if (!isMatch) {
      return res.status(401).json({ 
        message: 'Tên đăng nhập hoặc mật khẩu không đúng!' 
      });
    }

    const token = jwt.sign(
      { 
        MaTK: user._id, 
        TenDangNhap: user.TenDangNhap,
        MaVaiTro: user.MaVaiTro 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Đăng nhập thành công!',
      token,
      user: {
        MaTK: user._id,
        TenDangNhap: user.TenDangNhap,
        Email: user.Email,
        MaVaiTro: user.MaVaiTro
      }
    });

  } catch (error) {
    console.error('❌ Lỗi đăng nhập:', error);
    res.status(500).json({ 
      message: 'Đăng nhập thất bại!' 
    });
  }
};

// ======================= QUÊN MẬT KHẨU - BƯỚC 1: GỬI MÃ =======================
exports.forgotPassword = async (req, res) => {
  try {
    const { Email } = req.body;

    const user = await User.findOne({ Email });
    if (!user) {
      return res.status(404).json({ 
        message: 'Email không tồn tại trong hệ thống!' 
      });
    }

    // Tạo mã đặt lại mật khẩu
    const resetCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 phút

    user.resetPasswordCode = resetCode;
    user.resetPasswordExpires = expiresAt;
    await user.save();

    // Gửi email
    await sendPasswordResetEmail(Email, resetCode, user.TenDangNhap);

    res.json({ 
      message: 'Mã xác thực đã được gửi đến email của bạn!',
      email: Email,
      expiresIn: 600
    });

  } catch (error) {
    console.error('❌ Lỗi gửi mã đặt lại mật khẩu:', error);
    res.status(500).json({ 
      message: 'Không thể gửi mã xác thực. Vui lòng thử lại!' 
    });
  }
};

// ======================= QUÊN MẬT KHẨU - BƯỚC 2: XÁC THỰC VÀ ĐỔI MẬT KHẨU =======================
exports.resetPassword = async (req, res) => {
  try {
    const { Email, resetCode, MatKhauMoi } = req.body;

    const user = await User.findOne({ 
      Email,
      resetPasswordCode: resetCode
    });

    if (!user) {
      return res.status(400).json({ 
        message: 'Mã xác thực không đúng!' 
      });
    }

    // Kiểm tra mã đã hết hạn chưa
    if (user.resetPasswordExpires < new Date()) {
      return res.status(400).json({ 
        message: 'Mã xác thực đã hết hạn. Vui lòng yêu cầu mã mới!' 
      });
    }

    // Đổi mật khẩu
    user.MatKhau = MatKhauMoi;
    user.resetPasswordCode = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ 
      message: 'Đặt lại mật khẩu thành công!' 
    });

  } catch (error) {
    console.error('❌ Lỗi đặt lại mật khẩu:', error);
    res.status(500).json({ 
      message: 'Không thể đặt lại mật khẩu. Vui lòng thử lại!' 
    });
  }
};

// ======================= GỬI LẠI MÃ XÁC THỰC =======================
exports.resendVerificationCode = async (req, res) => {
  try {
    const { Email } = req.body;

    const user = await User.findOne({ Email, isVerified: false });
    if (!user) {
      return res.status(404).json({ 
        message: 'Không tìm thấy tài khoản cần xác thực!' 
      });
    }

    // Tạo mã mới
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    user.verificationCode = verificationCode;
    user.verificationCodeExpires = expiresAt;
    await user.save();

    // Gửi email
    await sendVerificationEmail(Email, verificationCode, user.TenDangNhap);

    res.json({ 
      message: 'Mã xác thực mới đã được gửi!',
      expiresIn: 600
    });

  } catch (error) {
    console.error('❌ Lỗi gửi lại mã:', error);
    res.status(500).json({ 
      message: 'Không thể gửi lại mã. Vui lòng thử lại!' 
    });
  }
};