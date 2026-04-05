const jwt = require('jsonwebtoken');

// Middleware to check if user is authenticated
const protect = (req, res, next) => {
  let token;

  // Extract token from Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.headers['x-auth-token']) {
    token = req.headers['x-auth-token'];
  }

  if (!token) {
    return res.status(401).json({ 
      message: 'Not authorized to access this route',
      code: 'NO_TOKEN'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    req.userId = decoded.id;
    next();
  } catch (error) {
    let code = 'INVALID_TOKEN';
    let message = 'Not authorized to access this route';
    
    if (error.name === 'TokenExpiredError') {
      code = 'TOKEN_EXPIRED';
      message = 'Token has expired. Please login again.';
    } else if (error.name === 'JsonWebTokenError') {
      code = 'MALFORMED_TOKEN';
      message = 'Invalid token.';
    }
    
    return res.status(401).json({ message, code });
  }
};

// Middleware to check if user is admin
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ 
      message: 'Not authorized as admin',
      code: 'ADMIN_ONLY'
    });
  }
};

// Middleware to check if user has specific role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Not authorized. Required roles: ${roles.join(', ')}`,
        code: 'INSUFFICIENT_ROLE'
      });
    }
    next();
  };
};

module.exports = { protect, admin, authorize };
