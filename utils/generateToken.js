import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key'; 

//generating a JWT token
export const generateToken = (userId) => {
    if (!userId) throw new Error('User ID is required to generate token');
    
    const payload = { id: userId };
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

