// utils/jwt.js
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key'; // Ensure this key is kept secret and secure

// Function to generate a JWT token
export const generateToken = (userId) => {
    if (!userId) throw new Error('User ID is required to generate token');
    
    const payload = { id: userId }; // Ensure this is a plain object
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
  
    return token;
  };

// Function to verify a JWT token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (error) {
    return null;
  }
};

