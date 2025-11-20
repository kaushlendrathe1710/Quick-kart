import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { cartApi } from '@/api/buyer';
import { cartKeys } from '@/constants/buyer';
import { useAppSelector } from '@/store/hooks';
import Layout from '@/components/buyer/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';

/**
 * Cart Page - Shopping cart management
 */
export default function CartPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // Fetch cart
  const { data: cart, isLoading } = useQuery({
    queryKey: cartKeys.detail(),
    queryFn: cartApi.getCart,
    enabled: isAuthenticated,
  });

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

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <ShoppingCart className="mx-auto h-24 w-24 text-gray-300" />
            <h2 className="mt-4 text-2xl font-bold">Please Login</h2>
            <p className="mt-2 text-gray-600">You need to login to view your cart</p>
            <Button className="mt-6" onClick={() => setLocation('/auth')}>
              Login
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
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

  const cartItems = cart?.items || [];
  const isEmpty = cartItems.length === 0;

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

  const subtotal = parseFloat(cart?.subtotal || '0');
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
      clearCartMutation.mutate();
    }
  };

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

              const imageUrl =
                product.thumbnail ||
                (product.imageUrls ? JSON.parse(product.imageUrls)[0] : null) ||
                '/placeholder-product.png';

              return (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <h3 className="line-clamp-1 font-semibold">{product.name}</h3>
                          <p className="text-sm text-gray-600">
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
                              onClick={() => handleUpdateQuantity(product.id, item.quantity, -1)}
                              disabled={updateCartMutation.isPending || item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-12 text-center font-semibold">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleUpdateQuantity(product.id, item.quantity, 1)}
                              disabled={
                                updateCartMutation.isPending ||
                                item.quantity >= (product.stock || 999)
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
                              onClick={() => handleRemove(product.id)}
                              disabled={removeFromCartMutation.isPending}
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
                    <span className="text-gray-600">Subtotal ({cart?.totalItems} items)</span>
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

                  {shipping > 0 && (
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

                <Button className="mt-6 w-full" size="lg" onClick={() => setLocation('/checkout')}>
                  Proceed to Checkout
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
