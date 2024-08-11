import express from 'express';
import {
  createAsset,
  updateAsset,
  publishAsset,
  getAssetDetails,
  getUserAssets,
} from '../controllers/assetsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create or Save Asset as Draft
router.post('/', protect, createAsset);

// Update Asset
router.post('/:id', protect, updateAsset);

// Publish Asset on Marketplace
router.put('/:id/publish', protect, publishAsset);

//Asset Details
router.get('/:id', protect, getAssetDetails);

// User's Assets
router.get('/user/:id', protect, getUserAssets);

export default router;
