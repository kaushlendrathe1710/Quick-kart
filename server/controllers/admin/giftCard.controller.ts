import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
import * as giftCardService from '../../db/services/giftCard.service';
import { getPaginationParams, createPaginatedResponse } from '../../utils/pagination.utils';

/**
 * Get all gift cards with pagination
 * GET /api/admin/gift-cards?page=1&limit=20&isActive=true
 */
export async function getAllGiftCards(req: AuthenticatedRequest, res: Response) {
  try {
    const { isActive } = req.query;
    const { page, limit, offset } = getPaginationParams(req);

    const filters = {
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      limit,
      offset,
    };

    const result = await giftCardService.getAllGiftCards(filters);

    if (result && typeof result === 'object' && 'data' in result && 'total' in result) {
      res.json(createPaginatedResponse(result.data, page, limit, result.total));
    } else {
      res.json(result);
    }
  } catch (error) {
    console.error('Error fetching gift cards:', error);
    res.status(500).json({ error: 'Failed to fetch gift cards' });
  }
}

/**
 * Create gift card
 * POST /api/admin/gift-cards
 */
export async function createGiftCard(req: AuthenticatedRequest, res: Response) {
  try {
    const giftCard = await giftCardService.createGiftCard(req.body);
    res.status(201).json({
      success: true,
      message: 'Gift card created successfully',
      giftCard,
    });
  } catch (error) {
    console.error('Error creating gift card:', error);
    res.status(500).json({ error: 'Failed to create gift card' });
  }
}

/**
 * Toggle gift card status
 * PUT /api/admin/gift-cards/:id/toggle-status
 */
export async function toggleGiftCardStatus(req: AuthenticatedRequest, res: Response) {
  try {
    const giftCardId = parseInt(req.params.id);

    if (isNaN(giftCardId)) {
      return res.status(400).json({ error: 'Invalid gift card ID' });
    }

    const giftCard = await giftCardService.toggleGiftCardStatus(giftCardId);

    if (!giftCard) {
      return res.status(404).json({ error: 'Gift card not found' });
    }

    res.json({
      success: true,
      message: 'Gift card status updated successfully',
      giftCard,
    });
  } catch (error) {
    console.error('Error toggling gift card status:', error);
    res.status(500).json({ error: 'Failed to toggle gift card status' });
  }
}

/**
 * Get all gift card templates
 * GET /api/admin/gift-card-templates
 */
export async function getAllGiftCardTemplates(req: AuthenticatedRequest, res: Response) {
  try {
    const templates = await giftCardService.getAllGiftCardTemplates();
    res.json(templates);
  } catch (error) {
    console.error('Error fetching gift card templates:', error);
    res.status(500).json({ error: 'Failed to fetch gift card templates' });
  }
}

/**
 * Create gift card template
 * POST /api/admin/gift-card-templates
 */
export async function createGiftCardTemplate(req: AuthenticatedRequest, res: Response) {
  try {
    const template = await giftCardService.createGiftCardTemplate(req.body);
    res.status(201).json({
      success: true,
      message: 'Gift card template created successfully',
      template,
    });
  } catch (error) {
    console.error('Error creating gift card template:', error);
    res.status(500).json({ error: 'Failed to create gift card template' });
  }
}

/**
 * Update gift card template
 * PUT /api/admin/gift-card-templates/:id
 */
export async function updateGiftCardTemplate(req: AuthenticatedRequest, res: Response) {
  try {
    const templateId = parseInt(req.params.id);

    if (isNaN(templateId)) {
      return res.status(400).json({ error: 'Invalid template ID' });
    }

    const template = await giftCardService.updateGiftCardTemplate(templateId, req.body);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json({
      success: true,
      message: 'Gift card template updated successfully',
      template,
    });
  } catch (error) {
    console.error('Error updating gift card template:', error);
    res.status(500).json({ error: 'Failed to update gift card template' });
  }
}

/**
 * Delete gift card template
 * DELETE /api/admin/gift-card-templates/:id
 */
export async function deleteGiftCardTemplate(req: AuthenticatedRequest, res: Response) {
  try {
    const templateId = parseInt(req.params.id);

    if (isNaN(templateId)) {
      return res.status(400).json({ error: 'Invalid template ID' });
    }

    const template = await giftCardService.deleteGiftCardTemplate(templateId);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json({
      success: true,
      message: 'Gift card template deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting gift card template:', error);
    res.status(500).json({ error: 'Failed to delete gift card template' });
  }
}
