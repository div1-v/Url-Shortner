const jwt = require('jsonwebtoken');
const User =  require('./../models/user');

module.exports.isAuthenticated =async(req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    const user = await User.findById(decoded._id);
    if(!user){
      return res.status(401).json({ message: 'Invalid Token Provided, User does not exist'});
    }
    req.user = user; 
    next(); 
  } catch (err) {
    return res.status(401).json({ message: 'Token is not valid' });
  }
};
