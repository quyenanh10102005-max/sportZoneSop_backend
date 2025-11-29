const nodemailer = require('nodemailer');

// Cấu hình transporter để gửi email
const transporter = nodemailer.createTransport({
  service: 'gmail', // hoặc 'outlook', 'yahoo', etc.
  auth: {
    user: process.env.EMAIL_USER, // Email của bạn
    pass: process.env.EMAIL_PASSWORD // Mật khẩu ứng dụng (App Password)
  }
});

// Hàm gửi mã xác thực
const sendVerificationEmail = async (toEmail, verificationCode, userName) => {
  try {
    const mailOptions = {
      from: `SportZoneVN <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: 'Mã xác thực đăng ký tài khoản - SportZoneVN',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border: 1px solid #ddd;
              border-top: none;
            }
            .code-box {
              background: white;
              border: 2px dashed #667eea;
              padding: 20px;
              text-align: center;
              margin: 20px 0;
              border-radius: 8px;
            }
            .code {
              font-size: 32px;
              font-weight: bold;
              color: #667eea;
              letter-spacing: 5px;
            }
            .footer {
              background: #333;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 0 0 10px 10px;
              font-size: 14px;
            }
            .warning {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>SportZoneVN</h1>
            <p>Giày bóng đá chính hãng Việt Nam</p>
          </div>
          
          <div class="content">
            <h2>Xin chào ${userName}!</h2>
            <p>Cảm ơn bạn đã đăng ký tài khoản tại SportZoneVN. Để hoàn tất quá trình đăng ký, vui lòng sử dụng mã xác thực bên dưới:</p>
            
            <div class="code-box">
              <div class="code">${verificationCode}</div>
              <p style="margin: 10px 0 0 0; color: #666;">Mã xác thực có hiệu lực trong 10 phút</p>
            </div>
            
            <div class="warning">
              <strong>⚠️ Lưu ý:</strong>
              <ul style="margin: 10px 0;">
                <li>Không chia sẻ mã này với bất kỳ ai</li>
                <li>SportZoneVN sẽ không bao giờ yêu cầu mã xác thực qua điện thoại</li>
                <li>Nếu bạn không thực hiện đăng ký, vui lòng bỏ qua email này</li>
              </ul>
            </div>
            
            <p>Nếu bạn gặp vấn đề, vui lòng liên hệ:</p>
            <ul>
              <li>Email: contact@sportzonevn.com</li>
              <li>Hotline: 0329127111</li>
            </ul>
          </div>
          
          <div class="footer">
            <p>&copy; 2025 SportZoneVN - Giày bóng đá chính hãng Việt Nam</p>
            <p>Địa chỉ: Đông Yên - Đông Sơn - Thanh Hóa</p>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Đã gửi email xác thực đến:', toEmail);
    return true;
  } catch (error) {
    console.error('❌ Lỗi gửi email:', error);
    throw error;
  }
};

// Hàm gửi email đặt lại mật khẩu
const sendPasswordResetEmail = async (toEmail, resetCode, userName) => {
  try {
    const mailOptions = {
      from: `SportZoneVN <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: 'Đặt lại mật khẩu - SportZoneVN',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border: 1px solid #ddd;
              border-top: none;
            }
            .code-box {
              background: white;
              border: 2px dashed #dc3545;
              padding: 20px;
              text-align: center;
              margin: 20px 0;
              border-radius: 8px;
            }
            .code {
              font-size: 32px;
              font-weight: bold;
              color: #dc3545;
              letter-spacing: 5px;
            }
            .footer {
              background: #333;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 0 0 10px 10px;
              font-size: 14px;
            }
            .warning {
              background: #f8d7da;
              border-left: 4px solid #dc3545;
              padding: 15px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🔐 Đặt lại mật khẩu</h1>
            <p>SportZoneVN</p>
          </div>
          
          <div class="content">
            <h2>Xin chào ${userName}!</h2>
            <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Sử dụng mã xác thực bên dưới để tiếp tục:</p>
            
            <div class="code-box">
              <div class="code">${resetCode}</div>
              <p style="margin: 10px 0 0 0; color: #666;">Mã có hiệu lực trong 10 phút</p>
            </div>
            
            <div class="warning">
              <strong>⚠️ Cảnh báo bảo mật:</strong>
              <ul style="margin: 10px 0;">
                <li>Nếu bạn KHÔNG yêu cầu đặt lại mật khẩu, hãy bỏ qua email này</li>
                <li>Không chia sẻ mã này với bất kỳ ai</li>
                <li>Thay đổi mật khẩu ngay nếu bạn nghi ngờ tài khoản bị xâm nhập</li>
              </ul>
            </div>
            
            <p>Cần hỗ trợ? Liên hệ ngay:</p>
            <ul>
              <li>Email: contact@sportzonevn.com</li>
              <li>Hotline: 0329127111</li>
            </ul>
          </div>
          
          <div class="footer">
            <p>&copy; 2025 SportZoneVN - Giày bóng đá chính hãng Việt Nam</p>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Đã gửi email đặt lại mật khẩu đến:', toEmail);
    return true;
  } catch (error) {
    console.error('❌ Lỗi gửi email:', error);
    throw error;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail
};