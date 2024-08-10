import { z } from 'zod';
import Asset from '../models/assetModel.js';
import Request from '../models/requestModel.js';
import asyncHandler from 'express-async-handler';

// Zod schemas
const requestSchema = z.object({
  proposedPrice: z.number().positive('Price must be a positive number'),
});

const negotiateSchema = z.object({
  newProposedPrice: z.number().positive('Price must be a positive number'),
});

// @desc    Get assets listed on the marketplace
// @route   GET /api/marketplace/assets
// @access  Private
export const getMarketplaceAssets = asyncHandler(async (req, res) => {
  const assets = await Asset.find({ status: 'published' }).populate('creator currentHolder', 'username');
  res.status(200).json(assets);
});

// @desc    Request to buy an asset
// @route   POST /api/marketplace/assets/:id/request
// @access  Private
export const requestToBuyAsset = asyncHandler(async (req, res) => {
  const validatedData = requestSchema.parse(req.body);

  const asset = await Asset.findById(req.params.id);
  if (!asset) {
    res.status(404);
    throw new Error('Asset not found');
  }

  const newRequest = await Request.create({
    asset: asset._id,
    buyer: req.user._id,
    proposedPrice: validatedData.proposedPrice,
  });

  res.status(201).json({
    message: 'Purchase request sent',
    requestId: newRequest._id,
  });
});

// @desc    Negotiate a purchase request
// @route   PUT /api/marketplace/requests/:id/negotiate
// @access  Private
export const negotiateRequest = asyncHandler(async (req, res) => {
  const validatedData = negotiateSchema.parse(req.body);

  const request = await Request.findById(req.params.id);
  if (!request) {
    res.status(404);
    throw new Error('Request not found');
  }

  if (request.holder.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to negotiate this request');
  }

  request.proposedPrice = validatedData.newProposedPrice;
  await request.save();

  res.status(200).json({
    message: 'Negotiation updated',
  });
});

// @desc    Accept a purchase request
// @route   PUT /api/marketplace/requests/:id/accept
// @access  Private
export const acceptRequest = asyncHandler(async (req, res) => {
  const request = await Request.findById(req.params.id);
  if (!request) {
    res.status(404);
    throw new Error('Request not found');
  }

  if (request.holder.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to accept this request');
  }

  const asset = await Asset.findById(request.asset);
  asset.currentHolder = request.buyer;
  await asset.save();

  request.status = 'accepted';
  await request.save();

  res.status(200).json({
    message: 'Request accepted, holder updated',
  });
});

// @desc    Deny a purchase request
// @route   PUT /api/marketplace/requests/:id/deny
// @access  Private
export const denyRequest = asyncHandler(async (req, res) => {
  const request = await Request.findById(req.params.id);
  if (!request) {
    res.status(404);
    throw new Error('Request not found');
  }

  if (request.holder.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to deny this request');
  }

  request.status = 'denied';
  await request.save();

  res.status(200).json({
    message: 'Request denied',
  });
});

// @desc    Get user's purchase requests
// @route   GET /api/marketplace/requests/user/:id
// @access  Private
export const getUserRequests = asyncHandler(async (req, res) => {
  const requests = await Request.find({ buyer: req.user._id });
  res.status(200).json(requests);
});


