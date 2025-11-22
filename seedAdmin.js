require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const createAdmin = async () => {
  try {
    console.log('🔄 Đang kết nối tới MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Kết nối MongoDB thành công!');
    
    // Kiểm tra xem admin đã tồn tại chưa
    const adminExists = await User.findOne({ MaVaiTro: 0 });
    if (adminExists) {
      console.log('⚠️  Tài khoản admin đã tồn tại!');
      console.log('📝 Username:', adminExists.TenDangNhap);
      console.log('📧 Email:', adminExists.Email);
      await mongoose.connection.close();
      process.exit(0);
    }

    // Tạo tài khoản admin mới
    console.log('🔄 Đang tạo tài khoản admin...');
    const admin = new User({
      TenDangNhap: 'admin',
      Email: 'admin@sportzone.vn',
      MatKhau: 'admin123', // Mật khẩu sẽ tự động được hash bởi pre-save hook
      MaVaiTro: 0  // 0 = Admin, 1 = Khách hàng
    });

    await admin.save();
    
    console.log('\n✅ TẠO TÀI KHOẢN ADMIN THÀNH CÔNG!');
    console.log('==========================================');
    console.log('👤 Username: admin');
    console.log('🔑 Password: admin123');
    console.log('📧 Email: admin@sportzone.vn');
    console.log('⚡ Vai trò: Admin (MaVaiTro: 0)');
    console.log('==========================================');
    console.log('🌐 Đăng nhập tại: http://localhost:3000/Admin_Login.html');
    console.log('\n⚠️  LƯU Ý: Hãy đổi mật khẩu sau khi đăng nhập lần đầu!\n');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi khi tạo admin:', err.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

createAdmin();