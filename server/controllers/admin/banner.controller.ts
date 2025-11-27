import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
import * as bannerService from '../../db/services/banner.service';
import { getPaginationParams, createPaginatedResponse } from '../../utils/pagination.utils';
import { uploadWithPath, UPLOAD_PATHS } from '../../utils/s3.utils';

/**
 * Get all banners with pagination
 * GET /api/admin/banners?page=1&limit=20
 */
export async function getAllBanners(req: AuthenticatedRequest, res: Response) {
  try {
    const { page, limit, offset } = getPaginationParams(req);

    const result = await bannerService.getAllBanners(limit, offset);

    res.json(createPaginatedResponse(result.data, page, limit, result.total));
  } catch (error) {
    console.error('Error fetching banners:', error);
    res.status(500).json({ error: 'Failed to fetch banners' });
  }
}

/**
 * Create banner
 * POST /api/admin/banners
 */
export async function createBanner(req: AuthenticatedRequest, res: Response) {
  try {
    const banner = await bannerService.createBanner(req.body);
    res.status(201).json({
      success: true,
      message: 'Banner created successfully',
      banner,
    });
  } catch (error) {
    console.error('Error creating banner:', error);
    res.status(500).json({ error: 'Failed to create banner' });
  }
}

/**
 * Update banner
 * PUT /api/admin/banners/:id
 */
export async function updateBanner(req: AuthenticatedRequest, res: Response) {
  try {
    const bannerId = parseInt(req.params.id);

    if (isNaN(bannerId)) {
      return res.status(400).json({ error: 'Invalid banner ID' });
    }

    const banner = await bannerService.updateBanner(bannerId, req.body);

    if (!banner) {
      return res.status(404).json({ error: 'Banner not found' });
    }

    res.json({
      success: true,
      message: 'Banner updated successfully',
      banner,
    });
  } catch (error) {
    console.error('Error updating banner:', error);
    res.status(500).json({ error: 'Failed to update banner' });
  }
}

/**
 * Delete banner
 * DELETE /api/admin/banners/:id
 */
export async function deleteBanner(req: AuthenticatedRequest, res: Response) {
  try {
    const bannerId = parseInt(req.params.id);

    if (isNaN(bannerId)) {
      return res.status(400).json({ error: 'Invalid banner ID' });
    }

    const banner = await bannerService.deleteBanner(bannerId);

    if (!banner) {
      return res.status(404).json({ error: 'Banner not found' });
    }

    res.json({
      success: true,
      message: 'Banner deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting banner:', error);
    res.status(500).json({ error: 'Failed to delete banner' });
  }
}

/**
 * Update banner position
 * PATCH /api/admin/banners/:id/position
 */
export async function updateBannerPosition(req: AuthenticatedRequest, res: Response) {
  try {
    const bannerId = parseInt(req.params.id);
    const { position } = req.body;

    if (isNaN(bannerId)) {
      return res.status(400).json({ error: 'Invalid banner ID' });
    }

    if (position === undefined || position === null) {
      return res.status(400).json({ error: 'Position is required' });
    }

    const banner = await bannerService.updateBannerPosition(bannerId, position);

    if (!banner) {
      return res.status(404).json({ error: 'Banner not found' });
    }

    res.json({
      success: true,
      message: 'Banner position updated successfully',
      banner,
    });
  } catch (error) {
    console.error('Error updating banner position:', error);
    res.status(500).json({ error: 'Failed to update banner position' });
  }
}

/**
 * Toggle banner active status
 * PATCH /api/admin/banners/:id/toggle-active
 */
export async function toggleBannerActive(req: AuthenticatedRequest, res: Response) {
  try {
    const bannerId = parseInt(req.params.id);

    if (isNaN(bannerId)) {
      return res.status(400).json({ error: 'Invalid banner ID' });
    }

    const banner = await bannerService.toggleBannerActive(bannerId);

    if (!banner) {
      return res.status(404).json({ error: 'Banner not found' });
    }

    res.json({
      success: true,
      message: 'Banner status updated successfully',
      banner,
    });
  } catch (error) {
    console.error('Error toggling banner status:', error);
    res.status(500).json({ error: 'Failed to toggle banner status' });
  }
}

/**
 * Upload banner image
 * POST /api/admin/banners/upload-image
 */
export async function uploadBannerImage(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    // Upload to S3 using the public banners path
    const imageUrl = await uploadWithPath({
      file: req.file,
      uploadPath: UPLOAD_PATHS.BANNER(),
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      maxFileSize: 10 * 1024 * 1024, // 10MB
    });

    res.status(200).json({
      success: true,
      message: 'Banner image uploaded successfully',
      imageUrl,
    });
  } catch (error) {
    console.error('Error uploading banner image:', error);
    res.status(500).json({ error: 'Failed to upload banner image' });
  }
}
