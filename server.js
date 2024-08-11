import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

dotenv.config(); // Load environment variables

connectDB(); // Connect to the database

const app = express();
app.use(express.json()); // Middleware to parse JSON

// Import routes using ES6 module syntax
import authRoutes from './routes/authRoutes.js';
import assetRoutes from './routes/assetRoutes.js';
import marketplaceRoutes from './routes/marketplaceRoutes.js';

// Use the routes
app.use('/auth', authRoutes);
app.use('/assets', assetRoutes);
app.use('/marketplace', marketplaceRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;