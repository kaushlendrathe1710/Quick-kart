import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { toast } from 'sonner';
import { wishlistApi, cartApi } from '@/api/buyer';
import { wishlistKeys, cartKeys } from '@/constants/buyer';
import { useWishlist } from '@/hooks/buyer';
import Layout from '@/components/buyer/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import type { Product } from '@shared/types';

/**
 * Wishlist Page - User's saved products
 */
export default function WishlistPage() {
  const queryClient = useQueryClient();
  const { wishlist, isLoadingWishlist, toggleWishlist } = useWishlist();

  // Remove from wishlist (using toggle function)
  const handleRemoveFromWishlist = (productId: number) => {
    toggleWishlist(productId);
  };

  // Move to cart
  const moveToCartMutation = useMutation({
    mutationFn: async (productId: number) => {
      await cartApi.addToCart({ productId, quantity: 1 });
      await wishlistApi.removeFromWishlist(productId);
    },
    onSuccess: () => {
      toast.success('Moved to cart');
      queryClient.invalidateQueries({ queryKey: wishlistKeys.all });
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
    onError: (error: any) => {
      toast.error(error || 'Failed to move to cart');
    },
  });

  const wishlistItems = wishlist || [];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Wishlist</h1>
            <p className="text-gray-600">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
            </p>
          </div>
        </div>

        {isLoadingWishlist ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-96 rounded-lg" />
            ))}
          </div>
        ) : wishlistItems.length === 0 ? (
          <Card>
            <CardContent className="py-20 text-center">
              <Heart className="mx-auto mb-4 h-16 w-16 text-gray-300" />
              <h2 className="mb-2 text-2xl font-semibold">Your wishlist is empty</h2>
              <p className="mb-6 text-gray-600">
                Save items you love so you don't lose sight of them.
              </p>
              <Link href="/products">
                <Button>Start Shopping</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {wishlistItems.map((item: any) => {
              const product = item.product || item;
              const imageUrl =
                product.thumbnail ||
                (product.imageUrls ? JSON.parse(product.imageUrls)[0] : null) ||
                '/placeholder-product.png';

              const mrp = product.mrp || product.price;
              const price =
                typeof product.price === 'string' ? parseFloat(product.price) : product.price;
              const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

              return (
                <Card key={product.id} className="group overflow-hidden">
                  <Link href={`/products/${product.id}`}>
                    <a>
                      <div className="relative aspect-square overflow-hidden bg-gray-100">
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                        {discount > 0 && (
                          <div className="absolute left-2 top-2 rounded bg-destructive px-2 py-1 text-xs font-semibold text-destructive-foreground">
                            {discount}% OFF
                          </div>
                        )}
                      </div>
                    </a>
                  </Link>

                  <CardContent className="p-4">
                    <Link href={`/products/${product.id}`}>
                      <a>
                        <h3 className="mb-2 line-clamp-2 font-semibold hover:text-primary">
                          {product.name}
                        </h3>
                      </a>
                    </Link>

                    <div className="mb-3 flex items-center gap-2">
                      <span className="text-xl font-bold">${price.toFixed(2)}</span>
                      {discount > 0 && (
                        <span className="text-sm text-gray-500 line-through">
                          ${mrp.toFixed(2)}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        size="sm"
                        onClick={() => moveToCartMutation.mutate(product.id)}
                        disabled={moveToCartMutation.isPending}
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Move to Cart
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveFromWishlist(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
