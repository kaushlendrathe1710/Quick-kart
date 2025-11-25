import { Link } from 'wouter';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Product } from '@shared/types';
import { cartApi } from '@/api/buyer';
import { cartKeys } from '@/constants/buyer';
import { useAppSelector } from '@/store/hooks';
import { guestCartUtils } from '@/utils/guestCart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HeartButton } from './HeartButton';

/**
 * Product Card Component - Displays product information
 */
interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: () => {
      if (isAuthenticated) {
        return cartApi.addToCart({ productId: product.id, quantity: 1 });
      } else {
        guestCartUtils.addItem(product.id, 1);
        return Promise.resolve({ success: true, message: 'Added to cart' });
      }
    },
    onSuccess: () => {
      toast.success('Added to cart');
      if (isAuthenticated) {
        queryClient.invalidateQueries({ queryKey: cartKeys.all });
      }
    },
    onError: (error: any) => {
      toast.error(error || 'Failed to add to cart');
    },
  });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCartMutation.mutate();
  };

  // Calculate discount percentage from MRP
  const mrp = product.mrp || product.price;
  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  const discount =
    mrp > product.price ? Math.round(((mrp - product.price) / mrp) * 100 * 100) / 100 : 0;

  const finalPrice = price;

  // Get image URL - handle both single thumbnail and array of images
  const imageUrl =
    product.thumbnail ||
    (product.imageUrls ? JSON.parse(product.imageUrls)[0] : null) ||
    '/placeholder-product.png';

  return (
    <Link href={`/products/${product.id}`}>
      <a>
        <Card className="group overflow-hidden transition-all hover:shadow-lg">
          <div className="relative aspect-square overflow-hidden bg-gray-100">
            <img
              src={imageUrl}
              alt={product.name}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
            {discount > 0 && (
              <Badge className="absolute left-2 top-2 bg-red-500">{discount}% OFF</Badge>
            )}
            <HeartButton
              productId={product.id}
              className="absolute right-2 top-2"
              showOnHoverOnly={true}
              iconClassName="h-4 w-4"
            />
          </div>
          <CardContent className="p-4">
            <h3 className="mb-1 line-clamp-1 font-semibold">{product.name}</h3>
            <p className="mb-2 line-clamp-2 text-sm text-gray-600">
              {product.description || 'No description available'}
            </p>
            <div className="mb-2 flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'h-4 w-4',
                    i < Math.floor(parseFloat(product.rating || '0'))
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-gray-200 text-gray-200'
                  )}
                />
              ))}
            </div>
            <span className="ml-1 text-sm text-gray-600">
              {product.rating ? parseFloat(product.rating.toString()).toFixed(1) : '0.0'}
            </span>
            <span className="text-sm text-gray-500">(0 reviews)</span>{' '}
            <div className="mb-3 flex items-center gap-2">
              <span className="text-lg font-bold">₹{finalPrice.toFixed(2)}</span>
              {discount > 0 && (
                <span className="text-sm text-gray-500 line-through">₹{mrp.toFixed(2)}</span>
              )}
            </div>
            {product.stock && product.stock > 0 ? (
              <Button
                className="w-full"
                onClick={handleAddToCart}
                disabled={addToCartMutation.isPending}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
            ) : (
              <Button className="w-full" disabled>
                Out of Stock
              </Button>
            )}
          </CardContent>
        </Card>
      </a>
    </Link>
  );
}
