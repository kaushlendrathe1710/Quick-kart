import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useSearch } from 'wouter';
import { productsApi } from '@/api/buyer';
import { productKeys, categoryKeys } from '@/constants/buyer';
import apiClient from '@/api/apiClient';
import Layout from '@/components/buyer/Layout';
import ProductCard from '@/components/buyer/product/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import type { Category, ListProductsInput } from '@shared/types';

/**
 * Products Page - Product listing with filters
 */
export default function ProductsPage() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);

  // Parse URL params - update when URL changes
  const [filters, setFilters] = useState<ListProductsInput>({
    page: parseInt(searchParams.get('page') || '1'),
    limit: 20,
    category: searchParams.get('category') ? parseInt(searchParams.get('category')!) : undefined,
    subcategory: searchParams.get('subcategory')
      ? parseInt(searchParams.get('subcategory')!)
      : undefined,
    minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
    maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
    search: searchParams.get('search') || undefined,
    sortBy: (searchParams.get('sortBy') as any) || 'createdAt',
    sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
    inStock: searchParams.get('inStock') === 'true' ? true : undefined,
  });

  // Update filters when URL changes
  useEffect(() => {
    const params = new URLSearchParams(searchString);
    setFilters({
      page: parseInt(params.get('page') || '1'),
      limit: 20,
      category: params.get('category') ? parseInt(params.get('category')!) : undefined,
      subcategory: params.get('subcategory') ? parseInt(params.get('subcategory')!) : undefined,
      minPrice: params.get('minPrice') ? parseFloat(params.get('minPrice')!) : undefined,
      maxPrice: params.get('maxPrice') ? parseFloat(params.get('maxPrice')!) : undefined,
      search: params.get('search') || undefined,
      sortBy: (params.get('sortBy') as any) || 'createdAt',
      sortOrder: (params.get('sortOrder') as any) || 'desc',
      inStock: params.get('inStock') === 'true' ? true : undefined,
    });
  });
  // Update filters when URL changes
  useEffect(() => {
    const params = new URLSearchParams(searchString);
    setFilters({
      page: parseInt(params.get('page') || '1'),
      limit: 20,
      category: params.get('category') ? parseInt(params.get('category')!) : undefined,
      subcategory: params.get('subcategory') ? parseInt(params.get('subcategory')!) : undefined,
      minPrice: params.get('minPrice') ? parseFloat(params.get('minPrice')!) : undefined,
      maxPrice: params.get('maxPrice') ? parseFloat(params.get('maxPrice')!) : undefined,
      search: params.get('search') || undefined,
      sortBy: (params.get('sortBy') as any) || 'createdAt',
      sortOrder: (params.get('sortOrder') as any) || 'desc',
      inStock: params.get('inStock') === 'true' ? true : undefined,
    });
  }, [searchString]);

  // Fetch products
  const { data: productsData, isLoading } = useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => productsApi.listProducts(filters),
  });

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: async () => {
      const response = await apiClient.get('/categories', {
        params: { page: 1, limit: 50, activeOnly: true },
      });
      return response.data.data; // Returns { categories: [], pagination: {} }
    },
  });

  const categories = categoriesData?.categories || [];

  const updateFilter = (key: keyof ListProductsInput, value: any) => {
    // Handle inStock checkbox: when unchecked (false), remove it from filters
    const newFilters = { ...filters, [key]: value, page: 1 };

    // Remove inStock from filters when it's false/unchecked
    if (key === 'inStock' && !value) {
      delete newFilters.inStock;
    }

    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== false) {
        params.set(k, v.toString());
      }
    });
    setLocation(`/products?${params.toString()}`, { replace: true });
  };

  const handlePageChange = (newPage: number) => {
    const newFilters = { ...filters, page: newPage };
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== false) {
        params.set(k, v.toString());
      }
    });
    setLocation(`/products?${params.toString()}`, { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setLocation('/products?page=1&limit=20&sortBy=createdAt&sortOrder=desc', { replace: true });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-gray-600">{productsData?.pagination.totalCount || 0} products found</p>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <aside className="hidden w-64 flex-shrink-0 lg:block">
            <div className="sticky top-20 space-y-6 rounded-lg border bg-white p-6">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <Filter className="h-5 w-5" />
                  Filters
                </h2>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear
                </Button>
              </div>

              {/* Category Filter */}
              <div>
                <Label className="mb-2 block">Category</Label>
                <Select
                  value={filters.category?.toString() || ''}
                  onValueChange={(value) =>
                    updateFilter('category', value === 'all' ? undefined : parseInt(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories?.map((category: Category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div>
                <Label className="mb-2 block">Price Range</Label>
                <div className="space-y-2">
                  <Input
                    type="number"
                    placeholder="Min Price"
                    value={filters.minPrice || ''}
                    onChange={(e) =>
                      updateFilter(
                        'minPrice',
                        e.target.value ? parseFloat(e.target.value) : undefined
                      )
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Max Price"
                    value={filters.maxPrice || ''}
                    onChange={(e) =>
                      updateFilter(
                        'maxPrice',
                        e.target.value ? parseFloat(e.target.value) : undefined
                      )
                    }
                  />
                </div>
              </div>

              {/* In Stock */}
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.inStock === true}
                    onChange={(e) => updateFilter('inStock', e.target.checked || undefined)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <span className="text-sm">In Stock Only</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Sort Options */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Label>Sort By:</Label>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value: any) => updateFilter('sortBy', value)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Newest</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.sortOrder}
                  onValueChange={(value: any) => updateFilter('sortOrder', value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Products */}
            {isLoading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <Skeleton key={i} className="h-96 rounded-lg" />
                ))}
              </div>
            ) : productsData?.products.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-xl text-gray-600">No products found</p>
                <Button onClick={clearFilters} className="mt-4">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {productsData?.products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {productsData?.pagination && productsData.pagination.totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange(filters.page! - 1)}
                      disabled={!productsData.pagination.hasPreviousPage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: productsData.pagination.totalPages }, (_, i) => i + 1)
                        .filter(
                          (page) =>
                            page === 1 ||
                            page === productsData.pagination.totalPages ||
                            Math.abs(page - filters.page!) <= 2
                        )
                        .map((page, idx, arr) => (
                          <>
                            {idx > 0 && arr[idx - 1] !== page - 1 && (
                              <span key={`ellipsis-${page}`} className="px-2">
                                ...
                              </span>
                            )}
                            <Button
                              key={page}
                              variant={page === filters.page ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </Button>
                          </>
                        ))}
                    </div>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange(filters.page! + 1)}
                      disabled={!productsData.pagination.hasNextPage}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
