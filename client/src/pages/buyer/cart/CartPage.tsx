import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { cartApi, productsApi } from '@/api/buyer';
import { cartKeys } from '@/constants/buyer';
import { useAppSelector } from '@/store/hooks';
import { guestCartUtils } from '@/utils/guestCart';
import Layout from '@/components/buyer/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';

/**
 * Cart Page - Shopping cart management (supports both auth and guest users)
 */
export default function CartPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [guestCart, setGuestCart] = useState(guestCartUtils.getCart());
  const [guestProducts, setGuestProducts] = useState<any[]>([]);
  const [loadingGuestProducts, setLoadingGuestProducts] = useState(false);

  // Fetch authenticated user's cart
  const { data: cart, isLoading } = useQuery({
    queryKey: cartKeys.detail(),
    queryFn: cartApi.getCart,
    enabled: isAuthenticated,
  });

  // Load guest cart products
  useEffect(() => {
    if (!isAuthenticated && guestCart.items.length > 0) {
      setLoadingGuestProducts(true);
      const productIds = Array.from(new Set(guestCart.items.map((item) => item.productId)));

      Promise.all(productIds.map((id) => productsApi.getProductById(id).catch(() => null)))
        .then((products) => {
          setGuestProducts(products.filter(Boolean));
        })
        .catch((error) => {
          console.error('Failed to load guest cart products:', error);
          toast.error('Failed to load some products');
        })
        .finally(() => {
          setLoadingGuestProducts(false);
        });
    }
  }, [isAuthenticated, guestCart.items.length]);

  // Update guest cart state when localStorage changes
  useEffect(() => {
    if (!isAuthenticated) {
      const handleCartUpdate = () => {
        setGuestCart(guestCartUtils.getCart());
      };

      window.addEventListener('guestCartUpdated', handleCartUpdate);
      window.addEventListener('storage', handleCartUpdate);

      return () => {
        window.removeEventListener('guestCartUpdated', handleCartUpdate);
        window.removeEventListener('storage', handleCartUpdate);
      };
    }
  }, [isAuthenticated]);

  // Update cart item mutation
  const updateCartMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: number; quantity: number }) =>
      cartApi.updateCartItem(productId, { quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
      toast.success('Cart updated');
    },
    onError: (error: any) => {
      toast.error(error || 'Failed to update cart');
    },
  });

  // Remove from cart mutation
  const removeFromCartMutation = useMutation({
    mutationFn: (productId: number) => cartApi.removeFromCart(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
      toast.success('Item removed from cart');
    },
    onError: (error: any) => {
      toast.error(error || 'Failed to remove item');
    },
  });

  // Clear cart mutation
  const clearCartMutation = useMutation({
    mutationFn: cartApi.clearCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
      toast.success('Cart cleared');
    },
    onError: (error: any) => {
      toast.error(error || 'Failed to clear cart');
    },
  });

  // Guest cart handlers
  const handleGuestUpdateQuantity = (
    productId: number,
    currentQuantity: number,
    change: number,
    variantId?: number | null
  ) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity > 0) {
      guestCartUtils.updateItem(productId, newQuantity, variantId);
      setGuestCart(guestCartUtils.getCart());
      toast.success('Cart updated');
    }
  };

  const handleGuestRemove = (productId: number, variantId?: number | null) => {
    if (confirm('Are you sure you want to remove this item?')) {
      guestCartUtils.removeItem(productId, variantId);
      setGuestCart(guestCartUtils.getCart());
      toast.success('Item removed from cart');
    }
  };

  const handleGuestClearCart = () => {
    if (confirm('Are you sure you want to clear your cart?')) {
      guestCartUtils.clearCart();
      setGuestCart(guestCartUtils.getCart());
      toast.success('Cart cleared');
    }
  };

  // Determine if cart is empty
  const isEmpty = isAuthenticated ? (cart?.items || []).length === 0 : guestCart.items.length === 0;

  // Loading state
  if (
    (isAuthenticated && isLoading) ||
    (!isAuthenticated && loadingGuestProducts && guestCart.items.length > 0)
  ) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="mb-4 h-10 w-48" />
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-lg" />
              ))}
            </div>
            <Skeleton className="h-64 rounded-lg" />
          </div>
        </div>
      </Layout>
    );
  }

  // Calculate cart totals
  let subtotal = 0;
  let totalItems = 0;

  if (isAuthenticated && cart) {
    subtotal = parseFloat(cart.subtotal || '0');
    totalItems = cart.totalItems || 0;
  } else if (!isAuthenticated) {
    guestCart.items.forEach((item) => {
      const product = guestProducts.find((p) => p.id === item.productId);
      if (product) {
        // Check if there's a variant with specific price
        const variant = product.variants?.find((v: any) => v.id === item.variantId);
        const price = variant ? variant.price : product.price;
        subtotal += price * item.quantity;
        totalItems += item.quantity;
      }
    });
  }

  const shipping = subtotal > 500 ? 0 : 50; // Free shipping over ₹500
  const tax = subtotal * 0.18; // 18% GST
  const total = subtotal + shipping + tax;

  const handleUpdateQuantity = (productId: number, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity > 0) {
      updateCartMutation.mutate({ productId, quantity: newQuantity });
    }
  };

  const handleRemove = (productId: number) => {
    if (confirm('Are you sure you want to remove this item?')) {
      removeFromCartMutation.mutate(productId);
    }
  };

  const handleClearCart = () => {
    if (confirm('Are you sure you want to clear your cart?')) {
      if (isAuthenticated) {
        clearCartMutation.mutate();
      } else {
        handleGuestClearCart();
      }
    }
  };

  // Prepare cart items for rendering
  type CartItemDisplay = {
    id: string | number;
    productId: number;
    variantId?: number | null;
    quantity: number;
    product: any;
  };

  const cartItems: CartItemDisplay[] = isAuthenticated
    ? (cart?.items || []).map((item) => ({
        id: item.id,
        productId: item.productId || item.product?.id || 0,
        variantId: (item as any).variantId || null,
        quantity: item.quantity,
        product: item.product,
      }))
    : guestCart.items
        .map((guestItem) => {
          const product = guestProducts.find((p) => p.id === guestItem.productId);
          if (!product) return null;

          const variant = product.variants?.find((v: any) => v.id === guestItem.variantId);

          return {
            id: `${guestItem.productId}-${guestItem.variantId || 'no-variant'}`,
            productId: guestItem.productId,
            variantId: guestItem.variantId || null,
            quantity: guestItem.quantity,
            product: {
              ...product,
              price: variant ? variant.price : product.price,
              stock: variant ? variant.stock : product.stock,
            },
          };
        })
        .filter((item): item is Exclude<typeof item, null> => item !== null);

  if (isEmpty) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <ShoppingCart className="mx-auto h-24 w-24 text-gray-300" />
            <h2 className="mt-4 text-2xl font-bold">Your cart is empty</h2>
            <p className="mt-2 text-gray-600">Add some products to get started</p>
            <Button className="mt-6" onClick={() => setLocation('/products')}>
              Continue Shopping
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
          {!isEmpty && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearCart}
              disabled={clearCartMutation.isPending}
            >
              Clear Cart
            </Button>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="space-y-4 lg:col-span-2">
            {cartItems.map((item) => {
              const product = item.product;
              if (!product) return null;

              // Get variant details from the item
              const variant = (item as any).variant;

              // Use variant image if available, otherwise product image
              const imageUrl =
                (variant?.images && JSON.parse(variant.images)?.[0]) ||
                product.thumbnail ||
                (product.imageUrls ? JSON.parse(product.imageUrls)[0] : null) ||
                '/placeholder-product.png';

              // Build variant label (e.g., "Color: Blue, Size: XL")
              const variantLabel: string[] = [];
              if (variant) {
                if (variant.color) variantLabel.push(`Color: ${variant.color}`);
                if (variant.size) variantLabel.push(`Size: ${variant.size}`);
                if (variant.sku) variantLabel.push(`SKU: ${variant.sku}`);
              }

              return (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Product Image - Clickable */}
                      <div
                        className="h-24 w-24 flex-shrink-0 cursor-pointer overflow-hidden rounded-lg bg-gray-100 transition-opacity hover:opacity-80"
                        onClick={() => {
                          const url = `/products/${product.id}${item.variantId ? `?variant=${item.variantId}` : ''}`;
                          setLocation(url);
                        }}
                      >
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <h3
                            className="line-clamp-1 cursor-pointer font-semibold transition-colors hover:text-blue-600"
                            onClick={() => {
                              const url = `/products/${product.id}${item.variantId ? `?variant=${item.variantId}` : ''}`;
                              setLocation(url);
                            }}
                          >
                            {product.name}
                          </h3>

                          {/* Display variant details */}
                          {variantLabel.length > 0 && (
                            <p className="mt-1 text-xs text-gray-500">{variantLabel.join(' • ')}</p>
                          )}

                          <p className="mt-1 text-sm text-gray-600">
                            ₹{parseFloat(product.price.toString()).toFixed(2)} each
                          </p>
                          {product.stock && product.stock < 10 && (
                            <p className="mt-1 text-xs text-orange-600">
                              Only {product.stock} left in stock
                            </p>
                          )}
                        </div>

                        <div className="mt-2 flex items-center justify-between">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                if (isAuthenticated) {
                                  handleUpdateQuantity(product.id, item.quantity, -1);
                                } else {
                                  handleGuestUpdateQuantity(
                                    item.productId,
                                    item.quantity,
                                    -1,
                                    item.variantId
                                  );
                                }
                              }}
                              disabled={
                                isAuthenticated
                                  ? updateCartMutation.isPending || item.quantity <= 1
                                  : item.quantity <= 1
                              }
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-12 text-center font-semibold">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                if (isAuthenticated) {
                                  handleUpdateQuantity(product.id, item.quantity, 1);
                                } else {
                                  handleGuestUpdateQuantity(
                                    item.productId,
                                    item.quantity,
                                    1,
                                    item.variantId
                                  );
                                }
                              }}
                              disabled={
                                isAuthenticated
                                  ? updateCartMutation.isPending ||
                                    item.quantity >= (product.stock || 999)
                                  : item.quantity >= (product.stock || 999)
                              }
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          {/* Subtotal and Remove */}
                          <div className="flex items-center gap-4">
                            <span className="font-bold">
                              ₹{(parseFloat(product.price.toString()) * item.quantity).toFixed(2)}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:text-red-700"
                              onClick={() => {
                                if (isAuthenticated) {
                                  handleRemove(product.id);
                                } else {
                                  handleGuestRemove(item.productId, item.variantId);
                                }
                              }}
                              disabled={isAuthenticated && removeFromCartMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardContent className="p-6">
                <h2 className="mb-4 text-xl font-bold">Order Summary</h2>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                    <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-semibold">
                      {shipping === 0 ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        `₹${shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>

                  {shipping > 0 && subtotal < 500 && (
                    <p className="text-xs text-gray-500">
                      Add ₹{(500 - subtotal).toFixed(2)} more for free shipping
                    </p>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (GST 18%)</span>
                    <span className="font-semibold">₹{tax.toFixed(2)}</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>

                {!isAuthenticated && (
                  <div className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                    Please login to proceed with checkout
                  </div>
                )}

                <Button
                  className="mt-6 w-full"
                  size="lg"
                  onClick={() => {
                    if (!isAuthenticated) {
                      toast.info('Please login to proceed with checkout');
                      setLocation('/auth');
                    } else {
                      setLocation('/checkout');
                    }
                  }}
                >
                  {!isAuthenticated ? 'Login to Checkout' : 'Proceed to Checkout'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>

                <Button
                  variant="outline"
                  className="mt-2 w-full"
                  onClick={() => setLocation('/products')}
                >
                  Continue Shopping
                </Button>

                <div className="mt-6 rounded-lg bg-blue-50 p-4">
                  <h3 className="mb-2 font-semibold text-blue-900">Secure Checkout</h3>
                  <p className="text-sm text-blue-800">
                    Your payment information is encrypted and secure
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
