const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'secret123key';

// Middleware xác thực token
exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  console.log('🔐 Verifying token...');
  console.log('Authorization header:', authHeader);
  
  if (!authHeader) {
    console.log('❌ No authorization header');
    return res.status(401).json({ message: 'Không có token xác thực' });
  }

  const token = authHeader.split(' ')[1];
  
  if (!token) {
    console.log('❌ No token found in header');
    return res.status(401).json({ message: 'Token không hợp lệ' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ Token verified:', { userId: decoded.userId, role: decoded.role });
    req.user = decoded;
    next();
  } catch (err) {
    console.log('❌ Token verification failed:', err.message);
    return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
};

// Middleware kiểm tra quyền admin
exports.isAdmin = (req, res, next) => {
  console.log('👮 Checking admin role...');
  console.log('User role:', req.user?.role);
  
  if (!req.user) {
    console.log('❌ No user in request');
    return res.status(401).json({ message: 'Chưa xác thực' });
  }
  
  if (req.user.role !== 0) {
    console.log('❌ User is not admin. Role:', req.user.role);
    return res.status(403).json({ message: 'Bạn không có quyền truy cập' });
  }
  
  console.log('✅ Admin access granted');
  next();
};