// testEmail.js
require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('=== EMAIL CONFIG TEST ===');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'Set (length: ' + process.env.EMAIL_PASSWORD.length + ')' : 'NOT SET');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

transporter.verify(function(error, success) {
  if (error) {
    console.log('❌ Verification failed:', error);
  } else {
    console.log('✅ Server is ready to send emails');
    
    // Send test email
    transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Gửi cho chính mình
      subject: 'Test Email from SportZoneVN',
      text: 'If you receive this, email is working!'
    }, (err, info) => {
      if (err) {
        console.log('❌ Send failed:', err);
      } else {
        console.log('✅ Email sent:', info.response);
      }
    });
  }
});