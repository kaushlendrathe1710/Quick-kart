import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
import * as categoryService from '../../db/services/category.service';
import { uploadWithPath, UPLOAD_PATHS } from '../../utils/s3.utils';
import { unlinkSync } from 'fs';

/**
 * Create a new category
 * POST /api/admin/categories
 */
export async function createCategory(req: AuthenticatedRequest, res: Response) {
  try {
    const { name, description, icon, isActive } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const category = await categoryService.createCategory({
      name,
      description,
      icon,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category,
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
}

/**
 * Update a category
 * PUT /api/admin/categories/:id
 */
export async function updateCategory(req: AuthenticatedRequest, res: Response) {
  try {
    const categoryId = parseInt(req.params.id);

    if (isNaN(categoryId)) {
      return res.status(400).json({ error: 'Invalid category ID' });
    }

    const { name, description, icon, isActive } = req.body;

    const category = await categoryService.updateCategory(categoryId, {
      name,
      description,
      icon,
      isActive,
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({
      success: true,
      message: 'Category updated successfully',
      category,
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
}

/**
 * Delete a category
 * DELETE /api/admin/categories/:id
 */
export async function deleteCategory(req: AuthenticatedRequest, res: Response) {
  try {
    const categoryId = parseInt(req.params.id);

    if (isNaN(categoryId)) {
      return res.status(400).json({ error: 'Invalid category ID' });
    }

    const success = await categoryService.deleteCategory(categoryId);

    if (!success) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
}

/**
 * Get all subcategories with pagination and category filter
 * GET /api/admin/subcategories
 */
export async function getAllSubcategories(req: AuthenticatedRequest, res: Response) {
  try {
    const { categoryId, page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    let subcategories;
    let total;

    if (categoryId) {
      const allSubcategories = await categoryService.getSubcategoriesByCategoryId(
        parseInt(categoryId as string)
      );
      total = allSubcategories.length;
      subcategories = allSubcategories.slice(offset, offset + limitNum);
    } else {
      const allSubcategories = await categoryService.getAllSubcategories();
      total = allSubcategories.length;
      subcategories = allSubcategories.slice(offset, offset + limitNum);
    }

    res.json({
      subcategories,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    res.status(500).json({ error: 'Failed to fetch subcategories' });
  }
}

/**
 * Create a new subcategory
 * POST /api/admin/subcategories
 */
export async function createSubcategory(req: AuthenticatedRequest, res: Response) {
  try {
    const { name, categoryId, description, image, active } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Subcategory name is required' });
    }

    if (!categoryId) {
      return res.status(400).json({ error: 'Category ID is required' });
    }

    const subcategory = await categoryService.createSubcategory({
      name,
      categoryId: parseInt(categoryId),
      description,
      image,
      active: active !== undefined ? active : true,
    });

    res.status(201).json({
      success: true,
      message: 'Subcategory created successfully',
      subcategory,
    });
  } catch (error) {
    console.error('Error creating subcategory:', error);
    res.status(500).json({ error: 'Failed to create subcategory' });
  }
}

/**
 * Update a subcategory
 * PUT /api/admin/subcategories/:id
 */
export async function updateSubcategory(req: AuthenticatedRequest, res: Response) {
  try {
    const subcategoryId = parseInt(req.params.id);

    if (isNaN(subcategoryId)) {
      return res.status(400).json({ error: 'Invalid subcategory ID' });
    }

    const { name, categoryId, description, image, displayOrder, active } = req.body;

    const subcategory = await categoryService.updateSubcategory(subcategoryId, {
      name,
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      description,
      image,
      displayOrder: displayOrder !== undefined ? parseInt(displayOrder) : undefined,
      active,
    });

    if (!subcategory) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }

    res.json({
      success: true,
      message: 'Subcategory updated successfully',
      subcategory,
    });
  } catch (error) {
    console.error('Error updating subcategory:', error);
    res.status(500).json({ error: 'Failed to update subcategory' });
  }
}

/**
 * Delete a subcategory
 * DELETE /api/admin/subcategories/:id
 */
export async function deleteSubcategory(req: AuthenticatedRequest, res: Response) {
  try {
    const subcategoryId = parseInt(req.params.id);

    if (isNaN(subcategoryId)) {
      return res.status(400).json({ error: 'Invalid subcategory ID' });
    }

    const success = await categoryService.deleteSubcategory(subcategoryId);

    if (!success) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }

    res.json({
      success: true,
      message: 'Subcategory deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting subcategory:', error);
    res.status(500).json({ error: 'Failed to delete subcategory' });
  }
}

/**
 * Upload category icon
 * POST /api/admin/categories/upload-icon
 */
export async function uploadCategoryIcon(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Upload to S3
    const iconUrl = await uploadWithPath({
      file: req.file,
      uploadPath: UPLOAD_PATHS.CATEGORY_ICONS(),
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'],
      maxFileSize: 500 * 1024, // 500KB
    });

    // Clean up local file
    try {
      unlinkSync(req.file.path);
    } catch (cleanupError) {
      console.error('Error cleaning up local file:', cleanupError);
    }

    res.json({
      success: true,
      message: 'Category icon uploaded successfully',
      iconUrl,
    });
  } catch (error: any) {
    console.error('Error uploading category icon:', error);

    // Clean up local file on error
    if (req.file?.path) {
      try {
        unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up local file after upload error:', cleanupError);
      }
    }

    res.status(500).json({ error: error.message || 'Failed to upload category icon' });
  }
}

/**
 * Upload subcategory image
 * POST /api/admin/subcategories/upload-image
 */
export async function uploadSubcategoryImage(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Upload to S3
    const imageUrl = await uploadWithPath({
      file: req.file,
      uploadPath: UPLOAD_PATHS.SUBCATEGORY_IMAGES(),
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      maxFileSize: 1024 * 1024, // 1MB
    });

    // Clean up local file
    try {
      unlinkSync(req.file.path);
    } catch (cleanupError) {
      console.error('Error cleaning up local file:', cleanupError);
    }

    res.json({
      success: true,
      message: 'Subcategory image uploaded successfully',
      imageUrl,
    });
  } catch (error: any) {
    console.error('Error uploading subcategory image:', error);

    // Clean up local file on error
    if (req.file?.path) {
      try {
        unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up local file after upload error:', cleanupError);
      }
    }

    res.status(500).json({ error: error.message || 'Failed to upload subcategory image' });
  }
}
