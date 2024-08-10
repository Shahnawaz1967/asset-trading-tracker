import jwt from 'jsonwebtoken';
import User from '../models/userModels.js';

export const protect = async (req, res, next) => {
  let token;

  // Check if the authorization header contains a Bearer token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract the token from the authorization header
      token = req.headers.authorization.split(' ')[1];

      // Verify the token using the JWT secret
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the user by ID and exclude the password field
      req.user = await User.findById(decoded.id).select('-password');

      // Call the next middleware or route handler
      next();
    } catch (error) {
      // If token verification fails, return an error
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  // If no token is found, return an error
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};
