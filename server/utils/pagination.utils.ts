import { Request } from 'express';
import { PAGINATION_DEFAULT_LIMIT, PAGINATION_UPPER_LIMIT } from '@server/constants';

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Extract and validate pagination parameters from request query
 * @param req - Express request object
 * @returns Validated pagination parameters
 */
export function getPaginationParams(req: Request): PaginationParams {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(
    PAGINATION_UPPER_LIMIT,
    Math.max(1, parseInt(req.query.limit as string) || PAGINATION_DEFAULT_LIMIT)
  );
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

/**
 * Create pagination metadata for API response
 * @param page - Current page number
 * @param limit - Items per page
 * @param total - Total number of items
 * @returns Pagination metadata object
 */
export function createPaginationMeta(page: number, limit: number, total: number): PaginationMeta {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

/**
 * Create paginated response with data and metadata
 * @param data - Array of items for current page
 * @param page - Current page number
 * @param limit - Items per page
 * @param total - Total number of items
 * @returns Paginated response object
 */
export function createPaginatedResponse<T>(data: T[], page: number, limit: number, total: number) {
  return {
    data,
    pagination: createPaginationMeta(page, limit, total),
  };
}
