import express from 'express';
import {
  getMarketplaceAssets,
  requestToBuyAsset,
  negotiateRequest,
  acceptRequest,
  denyRequest,
  getUserRequests,
} from '../controllers/marketplaceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get Assets on Marketplace
router.get('/assets', protect, getMarketplaceAssets);

// Request to Buy an Asset
router.post('/assets/:id/request', protect, requestToBuyAsset);

// Negotiate Purchase Request
router.put('/requests/:id/negotiate', protect, negotiateRequest);

// Accept Purchase Request
router.put('/requests/:id/accept', protect, acceptRequest);

// Deny Purchase Request
router.put('/requests/:id/deny', protect, denyRequest);

// Get User's Purchase Requests
router.get('/requests/user/:id', protect, getUserRequests);

export default router;

