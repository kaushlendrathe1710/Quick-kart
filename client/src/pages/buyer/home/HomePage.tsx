import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import apiClient from '@/api/apiClient';
import { productsApi } from '@/api/buyer';
import { getActiveBanners } from '@/api/public/banners';
import { productKeys, categoryKeys } from '@/constants/buyer';
import Layout from '@/components/buyer/Layout';
import ProductCard from '@/components/buyer/product/ProductCard';
import BannerCarousel from '@/components/buyer/home/BannerCarousel';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, TrendingUp, Package } from 'lucide-react';
import type { Product, PaginatedProductsResponse, Category } from '@shared/types';

/**
 * Home Page - Main buyer landing page
 * Features: Hero section, featured products, categories, new arrivals
 */
export default function HomePage() {
  // Fetch banners
  const { data: bannersData, isLoading: isLoadingBanners } = useQuery({
    queryKey: ['active-banners'],
    queryFn: getActiveBanners,
  });

  // Fetch featured products
  const { data: featuredProducts, isLoading: isLoadingFeatured } = useQuery({
    queryKey: productKeys.list({ featured: true }),
    queryFn: () =>
      productsApi.listProducts({
        page: 1,
        limit: 8,
        sortBy: 'rating',
        sortOrder: 'desc',
      }),
  });

  // Fetch new arrivals
  const { data: newArrivals, isLoading: isLoadingNew } = useQuery({
    queryKey: productKeys.list({ new: true }),
    queryFn: () =>
      productsApi.listProducts({
        page: 1,
        limit: 8,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }),
  });

  // Fetch categories
  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: async () => {
      const response = await apiClient.get('/categories', {
        params: { page: 1, limit: 8, activeOnly: true },
      });
      return response.data.data; // Returns { categories: [], pagination: {} }
    },
  });

  const categories = categoriesData?.categories || [];

  return (
    <Layout>
      {/* Hero Section - Banner Carousel */}
      {isLoadingBanners ? (
        <div className="h-[400px] w-full md:h-[500px]">
          <Skeleton className="h-full w-full" />
        </div>
      ) : (
        <BannerCarousel banners={bannersData?.data || []} />
      )}

      {/* Categories Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold">Shop by Category</h2>
          <Link href="/products">
            <Button variant="ghost">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {isLoadingCategories ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
            {categories?.slice(0, 6).map((category: Category) => (
              <Link key={category.id} href={`/products?category=${category.id}`}>
                <a className="group">
                  <div className="overflow-hidden rounded-lg border bg-white p-6 text-center transition-all hover:shadow-md">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="mx-auto mb-2 h-12 w-12 rounded object-cover"
                      />
                    ) : (
                      <Package className="mx-auto mb-2 h-8 w-8 text-primary" />
                    )}
                    <h3 className="font-semibold group-hover:text-primary">{category.name}</h3>
                  </div>
                </a>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Featured Products Section */}
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">Featured Products</h2>
              <p className="text-gray-600">Hand-picked products just for you</p>
            </div>
            <Link href="/products">
              <Button variant="outline">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {isLoadingFeatured ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-96 rounded-lg" />
              ))}
            </div>
          ) : featuredProducts?.products && featuredProducts.products.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.products.slice(0, 8).map((product: Product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-gray-500">No featured products available</p>
            </div>
          )}
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-3xl font-bold">
              <TrendingUp className="h-8 w-8 text-green-600" />
              New Arrivals
            </h2>
            <p className="text-gray-600">Check out our latest products</p>
          </div>
          <Link href="/products?sortBy=createdAt&sortOrder=desc">
            <Button variant="outline">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {isLoadingNew ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-96 rounded-lg" />
            ))}
          </div>
        ) : newArrivals?.products && newArrivals.products.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {newArrivals.products.slice(0, 8).map((product: Product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-gray-500">No new arrivals available</p>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-4xl font-bold">Ready to Start Shopping?</h2>
          <p className="mb-8 text-xl">
            Browse thousands of products and find exactly what you need
          </p>
          <Link href="/products">
            <Button size="lg" variant="secondary">
              Explore All Products
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
