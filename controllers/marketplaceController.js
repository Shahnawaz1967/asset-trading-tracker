import { z } from 'zod';
import Asset from '../models/assetModel.js';
import Request from '../models/requestModel.js';
import asyncHandler from 'express-async-handler';

// Zod schemas for requests
const requestSchema = z.object({
    proposedPrice: z.number().positive('Price must be a positive number').nonnegative({ message: "Price must be a non-negative number" }),
});

const negotiateSchema = z.object({
    newProposedPrice: z.number().positive('Price must be a positive number').nonnegative({ message: "Price must be a non-negative number" }),
});

// Get assets listed on the marketplace
export const getMarketplaceAssets = asyncHandler(async (req, res) => {
    const assets = await Asset.find({ status: 'published' }).populate('creator currentHolder', 'username');
    res.status(200).json(assets);
});

// Request to buy an asset
export const requestToBuyAsset = asyncHandler(async (req, res) => {
    try {
        const validatedData = requestSchema.parse(req.body);

        const asset = await Asset.findById(req.params.id);
        if (!asset) {
            res.status(404);
            throw new Error('Asset not found');
        }

        const newRequest = await Request.create({
            asset: asset._id,
            requester: req.user._id,  
            proposedPrice: validatedData.proposedPrice,
        });

        res.status(201).json({
            message: 'Purchase request sent',
            requestId: newRequest._id,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ errors: error.errors });
        } else {
            throw error; 
        }
    }
});

// Negotiate a purchase request
export const negotiateRequest = asyncHandler(async (req, res) => {
    try {
        const validatedData = negotiateSchema.parse(req.body);

        const request = await Request.findById(req.params.id);
        if (!request) {
            res.status(404);
            throw new Error('Request not found');
        }

        if (request.requester.toString() !== req.user._id.toString()) { 
            res.status(401);
            throw new Error('Not authorized to negotiate this request');
        }

        request.proposedPrice = validatedData.newProposedPrice;
        await request.save();

        res.status(200).json({
            message: 'Negotiation updated',
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ errors: error.errors });
        } else {
            throw error;
        }
    }
});

// Accept a purchase request
export const acceptRequest = asyncHandler(async (req, res) => {
    const request = await Request.findById(req.params.id);
    if (!request) {
        res.status(404);
        throw new Error('Request not found');
    }

    if (request.requester.toString() !== req.user._id.toString()) { 
        res.status(401);
        throw new Error('Not authorized to accept this request');
    }

    const asset = await Asset.findById(request.asset);
    asset.currentHolder = request.requester;  

    request.status = 'accepted';
    await request.save();

    res.status(200).json({
        message: 'Request accepted, holder updated',
    });
});

// Deny a purchase request
export const denyRequest = asyncHandler(async (req, res) => {
    const request = await Request.findById(req.params.id);
    if (!request) {
        res.status(404);
        throw new Error('Request not found');
    }

    if (request.requester.toString() !== req.user._id.toString()) {  
        res.status(401);
        throw new Error('Not authorized to deny this request');
    }

    request.status = 'denied';
    await request.save();

    res.status(200).json({
        message: 'Request denied',
    });
});

// Get user's purchase requests
export const getUserRequests = asyncHandler(async (req, res) => {
    const requests = await Request.find({ requester: req.user._id });  
    res.status(200).json(requests);
});
