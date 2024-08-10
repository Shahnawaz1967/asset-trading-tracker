import { z } from 'zod';
import Asset from '../models/assetModel.js';
import asyncHandler from 'express-async-handler';

// Zod schemas
const assetSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  image: z.string().url('Image must be a valid URL'),
  // status: z.enum(['draft', 'published']),
});

// @desc    Create or save an asset as draft
// @route   POST /api/assets
// @access  Private
export const createAsset = asyncHandler(async (req, res) => {
  const validatedData = assetSchema.parse(req.body);

  const asset = await Asset.create({
    ...validatedData,
    creator: req.user._id,
    currentHolder: req.user._id,
  });

  res.status(201).json({
    message: 'Asset created successfully',
    assetId: asset._id,
  });
});

// @desc    Update an asset
// @route   POST /api/assets/:id
// @access  Private
export const updateAsset = asyncHandler(async (req, res) => {
  const validatedData = assetSchema.parse(req.body);

  const asset = await Asset.findById(req.params.id);
  if (!asset) {
    res.status(404);
    throw new Error('Asset not found');
  }

  if (asset.creator.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this asset');
  }

  Object.assign(asset, validatedData);
  await asset.save();

  res.status(200).json({
    message: 'Asset updated successfully',
    assetId: asset._id,
  });
});

// @desc    Publish an asset on the marketplace
// @route   PUT /api/assets/:id/publish
// @access  Private
export const publishAsset = asyncHandler(async (req, res) => {
  const asset = await Asset.findById(req.params.id);
  if (!asset) {
    res.status(404);
    throw new Error('Asset not found');
  }

  if (asset.creator.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to publish this asset');
  }

  asset.status = 'published';
  await asset.save();

  res.status(200).json({
    message: 'Asset published successfully',
  });
});

// @desc    Get asset details
// @route   GET /api/assets/:id
// @access  Private
export const getAssetDetails = asyncHandler(async (req, res) => {
  const asset = await Asset.findById(req.params.id).populate('creator currentHolder', 'username');
  if (!asset) {
    res.status(404);
    throw new Error('Asset not found');
  }

  res.status(200).json(asset);
});

// @desc    Get user's assets
// @route   GET /api/assets/user/:id
// @access  Private
export const getUserAssets = asyncHandler(async (req, res) => {
  const assets = await Asset.find({ creator: req.user._id });
  res.status(200).json(assets);
});
