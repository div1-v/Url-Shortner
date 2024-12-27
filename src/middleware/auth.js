const jwt = require('jsonwebtoken');

module.exports.isAuthenticated = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    req.user = decoded; 
    next(); 
  } catch (err) {
    return res.status(401).json({ message: 'Token is not valid' });
  }
};
