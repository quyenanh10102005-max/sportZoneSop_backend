require('dotenv').config();

console.log('=== TESTING .ENV FILE ===');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ NOT SET');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ NOT SET');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ Set' : '❌ NOT SET');
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);