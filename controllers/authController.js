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

    console.log('📧 Send verification to:', Email);

    // ✅ Validate email
    if (!Email || !TenDangNhap) {
      return res.status(400).json({ 
        message: 'Email và tên đăng nhập là bắt buộc!' 
      });
    }

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ 
      $or: [{ Email }, { TenDangNhap }] 
    });
    
    if (existingUser && existingUser.isVerified) {
      console.log('❌ Email already exists:', Email);
      return res.status(400).json({ 
        message: 'Email hoặc tên đăng nhập đã được sử dụng!' 
      });
    }

    // Xóa user chưa xác thực cũ (nếu có)
    if (existingUser && !existingUser.isVerified) {
      await User.deleteOne({ _id: existingUser._id });
    }

    // Tạo mã xác thực
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 phút

    console.log('🔐 Generated code:', verificationCode);

    // Tạo tạm user
    const tempUser = new User({
      TenDangNhap,
      Email,
      MatKhau: 'temp_password_' + Date.now(),
      verificationCode,
      verificationCodeExpires: expiresAt,
      isVerified: false
    });

    await tempUser.save();
    console.log('💾 Temp user saved');

    // ✅ Gửi email với xử lý lỗi
    try {
      await sendVerificationEmail(Email, verificationCode, TenDangNhap);
      console.log('✅ Email sent successfully to:', Email);
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError.message);
      // Xóa user tạm nếu gửi email thất bại
      await User.deleteOne({ _id: tempUser._id });
      
      return res.status(500).json({ 
        message: 'Không thể gửi email. Kiểm tra cấu hình email server!',
        error: process.env.NODE_ENV === 'development' ? emailError.message : undefined
      });
    }

    res.json({ 
      message: 'Mã xác thực đã được gửi đến email của bạn!',
      email: Email,
      expiresIn: 600
    });

  } catch (error) {
    console.error('❌ Error in sendVerificationCode:', error);
    res.status(500).json({ 
      message: 'Không thể gửi mã xác thực. Vui lòng thử lại!',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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