import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { productsApi, cartApi } from '@/api/buyer';
import { productKeys, cartKeys } from '@/constants/buyer';
import { useAppSelector } from '@/store/hooks';
import { useWishlist } from '@/hooks/buyer';
import { guestCartUtils } from '@/utils/guestCart';
import Layout from '@/components/buyer/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Heart,
  ShoppingCart,
  Star,
  Minus,
  Plus,
  Package,
  Truck,
  Shield,
  ShoppingBag,
} from 'lucide-react';

/**
 * Product Details Page - Detailed product information
 */
export default function ProductDetailsPage() {
  const [, params] = useRoute('/products/:id');
  const [, setLocation] = useLocation();
  const productId = params?.id ? parseInt(params.id) : 0;
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { isInWishlist, toggleWishlist, isTogglingWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [variants, setVariants] = useState<any[]>([]);

  // Fetch product details
  const { data: product, isLoading } = useQuery({
    queryKey: productKeys.detail(productId),
    queryFn: () => productsApi.getProductById(productId),
    enabled: productId > 0,
  });

  // Fetch product reviews
  const { data: reviews } = useQuery({
    queryKey: productKeys.reviews(productId),
    queryFn: () => productsApi.getProductReviews(productId),
    enabled: productId > 0,
  });

  // Fetch cart to check if product/variant is in cart
  const { data: cartData } = useQuery({
    queryKey: cartKeys.all,
    queryFn: cartApi.getCart,
    enabled: isAuthenticated,
  });

  // Parse variants when product loads
  useEffect(() => {
    if (product?.variants) {
      try {
        // Variants are now an array from the API, not JSON string
        const parsedVariants = Array.isArray(product.variants) ? product.variants : [];

        if (parsedVariants.length > 0) {
          setVariants(parsedVariants);

          // Check if variant ID is in URL query params (from cart navigation)
          const urlParams = new URLSearchParams(window.location.search);
          const variantIdFromUrl = urlParams.get('variant');

          if (variantIdFromUrl) {
            const preselectedVariant = parsedVariants.find(
              (v: any) => v.id === parseInt(variantIdFromUrl)
            );
            if (preselectedVariant) {
              setSelectedVariant(preselectedVariant);
            } else {
              setSelectedVariant(parsedVariants[0]);
            }
          } else {
            setSelectedVariant(parsedVariants[0]);
          }
        }
      } catch (error) {
        console.error('Failed to parse variants:', error);
      }
    }
  }, [product]);

  // Check if current selection is in cart
  const isInCart = () => {
    if (isAuthenticated && cartData) {
      return cartData.items.some(
        (item: any) =>
          item.productId === productId &&
          (!selectedVariant || item.variantId === selectedVariant?.id)
      );
    } else {
      return guestCartUtils.isInCart(productId, selectedVariant?.id);
    }
  };

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: () => {
      if (isAuthenticated) {
        return cartApi.addToCart({
          productId,
          quantity,
          variantId: selectedVariant?.id,
        });
      } else {
        guestCartUtils.addItem(productId, quantity, selectedVariant?.id);
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

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-8 md:grid-cols-2">
            <Skeleton className="h-96 rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold">Product not found</h1>
        </div>
      </Layout>
    );
  }

  const images = product.imageUrls ? JSON.parse(product.imageUrls) : [product.thumbnail];
  const mrp = product.mrp || product.price;
  const discount =
    mrp > product.price ? Math.round(((mrp - product.price) / mrp) * 100 * 100) / 100 : 0;

  // Use variant price if selected, otherwise use product price
  const currentPrice = selectedVariant?.price || product.price;
  const price = typeof currentPrice === 'string' ? parseFloat(currentPrice) : currentPrice;
  const finalPrice = price;

  // Stock check - use variant stock if available
  const currentStock = selectedVariant?.stock !== undefined ? selectedVariant.stock : product.stock;
  const inStock = currentStock && currentStock > 0;

  const handleAddToCart = () => {
    addToCartMutation.mutate();
  };

  const handleGoToCart = () => {
    setLocation('/cart');
  };

  const handleAddToWishlist = () => {
    toggleWishlist(productId);
  };

  // Group variants by attribute (color, size, etc.)
  const variantGroups = variants.reduce((acc: any, variant: any) => {
    if (variant.color && !acc.color) acc.color = [];
    if (variant.size && !acc.size) acc.size = [];

    if (variant.color && !acc.color.includes(variant.color)) {
      acc.color.push(variant.color);
    }
    if (variant.size && !acc.size.includes(variant.size)) {
      acc.size.push(variant.size);
    }
    return acc;
  }, {});

  // Helper function to check if a variant combination exists
  const isVariantAvailable = (attribute: string, value: string): boolean => {
    const desiredColor = attribute === 'color' ? value : selectedVariant?.color;
    const desiredSize = attribute === 'size' ? value : selectedVariant?.size;

    return variants.some((v: any) => {
      const colorMatch = !desiredColor || v.color === desiredColor;
      const sizeMatch = !desiredSize || v.size === desiredSize;
      return colorMatch && sizeMatch;
    });
  };

  const handleVariantSelect = (attribute: string, value: string) => {
    // Build the desired combination based on current selection and new value
    const desiredColor = attribute === 'color' ? value : selectedVariant?.color;
    const desiredSize = attribute === 'size' ? value : selectedVariant?.size;

    // Try to find exact match with both attributes
    let matchedVariant = variants.find((v: any) => {
      const colorMatch = !desiredColor || v.color === desiredColor;
      const sizeMatch = !desiredSize || v.size === desiredSize;
      return colorMatch && sizeMatch;
    });

    if (matchedVariant) {
      setSelectedVariant(matchedVariant);
    } else {
      // Combination doesn't exist - show toast
      if (attribute === 'color' && desiredSize) {
        toast.error(`Size ${desiredSize} is not available in color ${value}`);
      } else if (attribute === 'size' && desiredColor) {
        toast.error(`Size ${value} is not available in color ${desiredColor}`);
      }

      // Try to find a fallback: keep the attribute user just selected, find any variant with it
      const fallbackVariant = variants.find((v: any) => {
        if (attribute === 'color') return v.color === value;
        if (attribute === 'size') return v.size === value;
        return false;
      });

      if (fallbackVariant) {
        setSelectedVariant(fallbackVariant);
      }
      // If no fallback found, keep current selection (don't change)
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
              <img
                src={images[selectedImage] || images[0]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
              {discount > 0 && (
                <Badge className="absolute left-4 top-4 bg-red-500 text-lg">{discount}% OFF</Badge>
              )}
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {images.map((image: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square overflow-hidden rounded-lg border-2 ${
                      selectedImage === idx ? 'border-blue-600' : 'border-gray-200'
                    }`}
                  >
                    <img src={image} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(parseFloat(product.rating || '0'))
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {product.rating ? parseFloat(product.rating.toString()).toFixed(1) : '0.0'} (0
                  reviews)
                </span>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold">₹{finalPrice.toFixed(2)}</span>
                {discount > 0 && (
                  <>
                    <span className="text-xl text-gray-500 line-through">₹{mrp.toFixed(2)}</span>
                    <Badge variant="secondary">Save ₹{(mrp - finalPrice).toFixed(2)}</Badge>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-600">Inclusive of all taxes</p>
            </div>

            <Separator />

            {/* Variant Selection */}
            {variants.length > 0 && (
              <div className="space-y-4">
                {variantGroups.color && (
                  <div>
                    <label className="mb-2 block font-semibold">Color:</label>
                    <div className="flex flex-wrap gap-2">
                      {variantGroups.color.map((color: string) => {
                        const available = isVariantAvailable('color', color);
                        return (
                          <button
                            key={color}
                            onClick={() => handleVariantSelect('color', color)}
                            disabled={!available}
                            className={`rounded-lg border-2 px-4 py-2 transition-colors ${
                              selectedVariant?.color === color
                                ? 'border-blue-600 bg-blue-50'
                                : available
                                  ? 'border-gray-300 hover:border-gray-400'
                                  : 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
                            }`}
                          >
                            {color}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {variantGroups.size && (
                  <div>
                    <label className="mb-2 block font-semibold">Size:</label>
                    <div className="flex flex-wrap gap-2">
                      {variantGroups.size.map((size: string) => {
                        const available = isVariantAvailable('size', size);
                        return (
                          <button
                            key={size}
                            onClick={() => handleVariantSelect('size', size)}
                            disabled={!available}
                            className={`rounded-lg border-2 px-4 py-2 transition-colors ${
                              selectedVariant?.size === size
                                ? 'border-blue-600 bg-blue-50'
                                : available
                                  ? 'border-gray-300 hover:border-gray-400'
                                  : 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
                            }`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                <Separator />
              </div>
            )}

            <div>
              <h3 className="mb-2 font-semibold">Description</h3>
              <p className="text-gray-700">{product.description || 'No description available'}</p>
            </div>

            {inStock ? (
              <>
                <div className="flex items-center gap-4">
                  <label className="font-semibold">Quantity:</label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-semibold">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.min(currentStock || 999, quantity + 1))}
                      disabled={quantity >= (currentStock || 999)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <span className="text-sm text-gray-600">{currentStock} in stock</span>
                </div>

                <div className="flex gap-4">
                  {isInCart() ? (
                    <Button
                      className="flex-1"
                      size="lg"
                      variant="secondary"
                      onClick={handleGoToCart}
                    >
                      <ShoppingBag className="mr-2 h-5 w-5" />
                      Go to Cart
                    </Button>
                  ) : (
                    <Button
                      className="flex-1"
                      size="lg"
                      onClick={handleAddToCart}
                      disabled={addToCartMutation.isPending}
                    >
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Add to Cart
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleAddToWishlist}
                    disabled={isTogglingWishlist || !isAuthenticated}
                    className={isInWishlist(productId) ? 'border-red-500 bg-red-50' : ''}
                  >
                    <Heart
                      className={`h-5 w-5 transition-colors ${isInWishlist(productId) ? 'fill-red-500 text-red-500' : ''}`}
                    />
                  </Button>
                </div>
              </>
            ) : (
              <div className="rounded-lg bg-red-50 p-4">
                <p className="font-semibold text-red-600">Out of Stock</p>
                <p className="text-sm text-red-500">This product is currently unavailable</p>
              </div>
            )}

            <Separator />

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex items-center gap-3">
                <Package className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="font-semibold">Quality</p>
                  <p className="text-sm text-gray-600">Assured</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Truck className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="font-semibold">Fast</p>
                  <p className="text-sm text-gray-600">Delivery</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="font-semibold">Secure</p>
                  <p className="text-sm text-gray-600">Payment</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <Tabs defaultValue="reviews">
            <TabsList>
              <TabsTrigger value="reviews">Reviews ({reviews?.length || 0})</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
            </TabsList>
            <TabsContent value="reviews" className="mt-6">
              {reviews && reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review: any) => (
                    <div key={review.id} className="rounded-lg border p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-semibold">{review.username}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {review.title && <p className="font-semibold">{review.title}</p>}
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-600">No reviews yet</p>
              )}
            </TabsContent>
            <TabsContent value="specifications" className="mt-6">
              {product.specifications ? (
                <div className="rounded-lg border p-6">
                  {Object.entries(JSON.parse(product.specifications as any)).map(([key, value]) => (
                    <div key={key} className="flex border-b py-3 last:border-0">
                      <span className="w-1/3 font-semibold capitalize">{key}</span>
                      <span className="w-2/3 text-gray-700">{value as string}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-600">No specifications available</p>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
