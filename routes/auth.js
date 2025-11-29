const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');
//  Đăng ký với xác thực email
router.post('/send-verification', auth.sendVerificationCode);
router.post('/verify-register', auth.verifyAndRegister);
router.post('/resend-verification', auth.resendVerificationCode);

//  Đăng nhập
router.post('/login', auth.login);

//  Quên mật khẩu
router.post('/forgot-password', auth.forgotPassword);
router.post('/reset-password', auth.resetPassword);

module.exports = router;


