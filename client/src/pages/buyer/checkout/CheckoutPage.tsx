import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { cartApi, ordersApi, profileApi } from '@/api/buyer';
import { cartKeys, orderKeys, profileKeys } from '@/constants/buyer';
import { useAppSelector } from '@/store/hooks';
import { createAddressSchema, type CreateAddressInput } from '@shared/types';
import Layout from '@/components/buyer/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { MapPin, Plus, CreditCard, Loader2, CheckCircle2 } from 'lucide-react';

/**
 * Checkout Page - Order placement with address selection
 */
export default function CheckoutPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');

  // Fetch cart
  const { data: cart, isLoading: loadingCart } = useQuery({
    queryKey: cartKeys.detail(),
    queryFn: cartApi.getCart,
    enabled: isAuthenticated,
  });

  // Fetch addresses
  const { data: addresses, isLoading: loadingAddresses } = useQuery({
    queryKey: profileKeys.addresses(),
    queryFn: profileApi.getAllAddresses,
    enabled: isAuthenticated,
  });

  // Address form
  const addressForm = useForm<CreateAddressInput>({
    resolver: zodResolver(createAddressSchema) as any,
    defaultValues: {
      addressType: 'Home',
      addressLine: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
      landmark: '',
      contactNumber: '',
      isDefault: false,
    },
  });

  // Create address mutation
  const createAddressMutation = useMutation({
    mutationFn: profileApi.createAddress,
    onSuccess: (data) => {
      toast.success('Address added successfully');
      queryClient.invalidateQueries({ queryKey: profileKeys.addresses() });
      setSelectedAddressId(data.address.id);
      setShowAddressDialog(false);
      addressForm.reset();
    },
    onError: (error: any) => {
      const errorMessage = error?.message || error?.toString() || 'Failed to add address';
      toast.error(errorMessage);
    },
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: ordersApi.createOrder,
    onSuccess: (data) => {
      toast.success('Order placed successfully!');
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      setLocation(`/orders/${data.order.id}`);
    },
    onError: (error: any) => {
      const errorMessage = error?.message || error?.toString() || 'Failed to place order';
      toast.error(errorMessage);
    },
  });

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold">Please Login</h2>
          <p className="mt-2 text-gray-600">You need to login to checkout</p>
          <Button className="mt-6" onClick={() => setLocation('/auth')}>
            Login
          </Button>
        </div>
      </Layout>
    );
  }

  if (loadingCart || loadingAddresses) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="mb-4 h-10 w-48" />
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <Skeleton className="h-64 rounded-lg" />
              <Skeleton className="h-64 rounded-lg" />
            </div>
            <Skeleton className="h-96 rounded-lg" />
          </div>
        </div>
      </Layout>
    );
  }

  const cartItems = cart?.items || [];
  if (cartItems.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold">Your cart is empty</h2>
          <Button className="mt-6" onClick={() => setLocation('/products')}>
            Continue Shopping
          </Button>
        </div>
      </Layout>
    );
  }

  const subtotal = parseFloat(cart?.subtotal || '0');
  const shipping = subtotal > 500 ? 0 : 50;
  const tax = subtotal * 0.18;
  const total = subtotal + shipping + tax;

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error('Please select a delivery address');
      return;
    }

    const orderData = {
      addressId: selectedAddressId,
      totalAmount: subtotal.toFixed(2),
      finalAmount: total.toFixed(2),
      items: cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.product?.price.toString() || '0',
        finalPrice: item.product?.price.toString() || '0',
      })),
    };

    createOrderMutation.mutate(orderData);
  };

  const onAddressSubmit = (data: CreateAddressInput) => {
    createAddressMutation.mutate(data);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">Checkout</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Delivery Address
                  </CardTitle>
                  <Dialog open={showAddressDialog} onOpenChange={setShowAddressDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Plus className="mr-2 h-4 w-4" />
                        Add New
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Add New Address</DialogTitle>
                        <DialogDescription>
                          Enter your delivery address details below.
                        </DialogDescription>
                      </DialogHeader>
                      <form
                        onSubmit={addressForm.handleSubmit(onAddressSubmit)}
                        className="space-y-4"
                      >
                        <div>
                          <Label htmlFor="addressType">Address Type</Label>
                          <Input
                            id="addressType"
                            placeholder="e.g., Home, Office"
                            {...addressForm.register('addressType')}
                          />
                          {addressForm.formState.errors.addressType && (
                            <p className="mt-1 text-sm text-red-600">
                              {addressForm.formState.errors.addressType.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="addressLine">Address Line</Label>
                          <Input
                            id="addressLine"
                            placeholder="Street, Building, Area"
                            {...addressForm.register('addressLine')}
                          />
                          {addressForm.formState.errors.addressLine && (
                            <p className="mt-1 text-sm text-red-600">
                              {addressForm.formState.errors.addressLine.message}
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="city">City</Label>
                            <Input id="city" {...addressForm.register('city')} />
                            {addressForm.formState.errors.city && (
                              <p className="mt-1 text-sm text-red-600">
                                {addressForm.formState.errors.city.message}
                              </p>
                            )}
                          </div>
                          <div>
                            <Label htmlFor="state">State</Label>
                            <Input id="state" {...addressForm.register('state')} />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="postalCode">Postal Code</Label>
                            <Input id="postalCode" {...addressForm.register('postalCode')} />
                            {addressForm.formState.errors.postalCode && (
                              <p className="mt-1 text-sm text-red-600">
                                {addressForm.formState.errors.postalCode.message}
                              </p>
                            )}
                          </div>
                          <div>
                            <Label htmlFor="contactNumber">Contact Number</Label>
                            <Input id="contactNumber" {...addressForm.register('contactNumber')} />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="landmark">Landmark (Optional)</Label>
                          <Input id="landmark" {...addressForm.register('landmark')} />
                        </div>

                        <Button
                          type="submit"
                          className="w-full"
                          disabled={createAddressMutation.isPending}
                        >
                          {createAddressMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Adding...
                            </>
                          ) : (
                            'Add Address'
                          )}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {addresses && addresses.length > 0 ? (
                  <div className="space-y-3">
                    {addresses.map((address) => (
                      <button
                        key={address.id}
                        onClick={() => setSelectedAddressId(address.id)}
                        className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                          selectedAddressId === address.id
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{address.addressType}</span>
                              {address.isDefault && (
                                <span className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-sm text-gray-700">{address.addressLine}</p>
                            <p className="text-sm text-gray-600">
                              {address.city}, {address.state} - {address.postalCode}
                            </p>
                            {address.contactNumber && (
                              <p className="mt-1 text-sm text-gray-600">
                                Phone: {address.contactNumber}
                              </p>
                            )}
                          </div>
                          {selectedAddressId === address.id && (
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-600">No addresses found. Please add one.</p>
                )}
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <button
                    onClick={() => setPaymentMethod('cod')}
                    className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-primary bg-[hsl(var(--primary)/0.1)]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Cash on Delivery</p>
                        <p className="text-sm text-gray-600">Pay when you receive</p>
                      </div>
                      {paymentMethod === 'cod' && <CheckCircle2 className="h-5 w-5 text-primary" />}
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('online')}
                    className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                      paymentMethod === 'online'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Online Payment</p>
                        <p className="text-sm text-gray-600">UPI, Cards, Net Banking</p>
                      </div>
                      {paymentMethod === 'online' && (
                        <CheckCircle2 className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardContent className="p-6">
                <h2 className="mb-4 text-xl font-bold">Order Summary</h2>

                <div className="mb-4 space-y-2">
                  {cartItems.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="line-clamp-1 text-gray-600">
                        {item.product?.name} × {item.quantity}
                      </span>
                      <span className="font-semibold">
                        ₹
                        {(
                          parseFloat(item.product?.price.toString() || '0') * item.quantity
                        ).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  {cartItems.length > 3 && (
                    <p className="text-sm text-gray-500">+ {cartItems.length - 3} more items</p>
                  )}
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
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
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (GST 18%)</span>
                    <span className="font-semibold">₹{tax.toFixed(2)}</span>
                  </div>

                  <Separator className="my-2" />

                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  className="mt-6 w-full"
                  size="lg"
                  onClick={handlePlaceOrder}
                  disabled={!selectedAddressId || createOrderMutation.isPending}
                >
                  {createOrderMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    'Place Order'
                  )}
                </Button>

                <p className="mt-4 text-center text-xs text-gray-500">
                  By placing your order, you agree to our terms and conditions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
