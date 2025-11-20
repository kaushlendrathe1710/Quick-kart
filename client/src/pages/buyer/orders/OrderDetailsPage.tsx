import { useRoute } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ordersApi } from '@/api/buyer';
import { orderKeys } from '@/constants/buyer';
import { useAppSelector } from '@/store/hooks';
import Layout from '@/components/buyer/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, MapPin, CreditCard, Calendar, XCircle, CheckCircle2 } from 'lucide-react';

/**
 * Order Details Page - Detailed view of a single order
 */
export default function OrderDetailsPage() {
  const [, params] = useRoute('/orders/:id');
  const orderId = params?.id ? parseInt(params.id) : 0;
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // Fetch order details
  const { data: order, isLoading } = useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: () => ordersApi.getOrderById(orderId),
    enabled: isAuthenticated && orderId > 0,
  });

  // Cancel order mutation
  const cancelOrderMutation = useMutation({
    mutationFn: (reason: string) => ordersApi.cancelOrder(orderId, reason),
    onSuccess: () => {
      toast.success('Order cancelled successfully');
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
    onError: (error: any) => {
      toast.error(error || 'Failed to cancel order');
    },
  });

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold">Please Login</h2>
          <p className="mt-2 text-gray-600">You need to login to view order details</p>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="mb-6 h-10 w-64" />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Skeleton className="h-64 rounded-lg" />
              <Skeleton className="h-64 rounded-lg" />
            </div>
            <Skeleton className="h-96 rounded-lg" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold">Order not found</h2>
        </div>
      </Layout>
    );
  }

  const totalAmount = parseFloat(order.finalAmount || order.totalAmount);
  const orderDate = order.createdAt ? new Date(order.createdAt) : new Date();
  const canCancel = ['pending', 'confirmed'].includes(order.orderStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCancelOrder = () => {
    if (confirm('Are you sure you want to cancel this order?')) {
      cancelOrderMutation.mutate('Customer requested cancellation');
    }
  };

  const orderTimeline = [
    { status: 'pending', label: 'Order Placed', completed: true },
    {
      label: 'Confirmed',
      completed: ['confirmed', 'processing', 'shipped', 'delivered'].includes(order.orderStatus),
    },
    {
      label: 'Processing',
      completed: ['processing', 'shipped', 'delivered'].includes(order.orderStatus),
    },
    {
      label: 'Shipped',
      completed: ['shipped', 'delivered'].includes(order.orderStatus),
    },
    {
      label: 'Delivered',
      completed: order.orderStatus === 'delivered',
    },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Order #{order.id}</h1>
            <p className="text-gray-600">
              Placed on {orderDate.toLocaleDateString()} at {orderDate.toLocaleTimeString()}
            </p>
          </div>
          <Badge className={`text-base ${getStatusColor(order.orderStatus)}`}>
            {order.orderStatus.toUpperCase()}
          </Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* Order Timeline */}
            {order.orderStatus !== 'cancelled' && (
              <Card>
                <CardHeader>
                  <CardTitle>Order Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <div className="absolute bottom-0 left-4 top-0 w-0.5 bg-gray-200" />
                    <div className="space-y-6">
                      {orderTimeline.map((step, index) => (
                        <div key={step.status} className="relative flex items-start gap-4">
                          <div
                            className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                              step.completed
                                ? 'border-green-600 bg-green-600'
                                : 'border-gray-300 bg-white'
                            }`}
                          >
                            {step.completed && <CheckCircle2 className="h-5 w-5 text-white" />}
                          </div>
                          <div className="flex-1 pt-0.5">
                            <p
                              className={`font-semibold ${step.completed ? 'text-gray-900' : 'text-gray-400'}`}
                            >
                              {step.label}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Order items details will be loaded from order items API.
                  </p>
                  {/* {order.items?.map((item: any) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        <img
                          src={item.product?.thumbnail || '/placeholder-product.png'}
                          alt={item.product?.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{item.product?.name}</h4>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        <p className="mt-1 font-semibold">
                          ₹{parseFloat(item.finalPrice || item.price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))} */}
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-gray-600">Address ID: {order.addressId}</p>
                  <p className="mt-2 text-sm text-gray-500">
                    Full address details will be loaded from address API.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">
                      ₹{parseFloat(order.totalAmount).toFixed(2)}
                    </span>
                  </div>
                  {order.discount && parseFloat(order.discount) > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>-₹{parseFloat(order.discount).toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>₹{totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <Separator />
                <div>
                  <p className="text-sm text-gray-600">Payment Status</p>
                  <Badge
                    className="mt-2"
                    variant={order.paymentStatus === 'completed' ? 'default' : 'secondary'}
                  >
                    {order.paymentStatus?.toUpperCase()}
                  </Badge>
                </div>

                {order.trackingNumber && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-gray-600">Tracking Number</p>
                      <p className="mt-1 font-mono font-semibold">{order.trackingNumber}</p>
                    </div>
                  </>
                )}

                {canCancel && (
                  <>
                    <Separator />
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={handleCancelOrder}
                      disabled={cancelOrderMutation.isPending}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Cancel Order
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
