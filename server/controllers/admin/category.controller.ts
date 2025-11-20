import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
import * as categoryService from '../../db/services/category.service';

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
 * Get all subcategories
 * GET /api/admin/subcategories
 */
export async function getAllSubcategories(req: AuthenticatedRequest, res: Response) {
  try {
    const { categoryId } = req.query;

    let subcategories;
    if (categoryId) {
      subcategories = await categoryService.getSubcategoriesByCategoryId(
        parseInt(categoryId as string)
      );
    } else {
      subcategories = await categoryService.getAllSubcategories();
    }

    res.json(subcategories);
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
