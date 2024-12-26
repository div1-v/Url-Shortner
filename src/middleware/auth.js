const jwt = require('jsonwebtoken');

// Middleware to authenticate JWT
module.exports.isAuthenticated = (req, res, next) => {
  // Get the token from the Authorization header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    req.user = decoded; // Attach user info to the request
    next(); // Pass control to the next middleware/route handler
  } catch (err) {
    return res.status(401).json({ message: 'Token is not valid' });
  }
};
