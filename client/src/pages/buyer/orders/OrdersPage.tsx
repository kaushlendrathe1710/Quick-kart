import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { ordersApi } from '@/api/buyer';
import { orderKeys } from '@/constants/buyer';
import { useAppSelector } from '@/store/hooks';
import Layout from '@/components/buyer/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, Eye, Calendar } from 'lucide-react';
import type { Order } from '@shared/types';

/**
 * Orders Page - List of user orders
 */
export default function OrdersPage() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // Fetch orders
  const { data: ordersData, isLoading } = useQuery({
    queryKey: orderKeys.lists(),
    queryFn: () => ordersApi.getUserOrders(),
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <Package className="mx-auto h-24 w-24 text-gray-300" />
          <h2 className="mt-4 text-2xl font-bold">Please Login</h2>
          <p className="mt-2 text-gray-600">You need to login to view your orders</p>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="mb-4 h-10 w-48" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-lg" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  const orders = ordersData?.orders || [];

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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">My Orders</h1>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="py-20 text-center">
              <Package className="mx-auto h-24 w-24 text-gray-300" />
              <h2 className="mt-4 text-xl font-semibold">No orders yet</h2>
              <p className="mt-2 text-gray-600">Start shopping to place your first order</p>
              <Link href="/products">
                <Button className="mt-6">Continue Shopping</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order: Order) => {
              const totalAmount = parseFloat(order.finalAmount || order.totalAmount);
              const orderDate = order.createdAt ? new Date(order.createdAt) : new Date();

              return (
                <Card key={order.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    {/* Order Header */}
                    <div className="bg-gray-50 px-6 py-4">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-6">
                          <div>
                            <p className="text-sm text-gray-600">Order ID</p>
                            <p className="font-semibold">#{order.id}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Date</p>
                            <p className="flex items-center gap-1 font-semibold">
                              <Calendar className="h-4 w-4" />
                              {orderDate.toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Total</p>
                            <p className="font-semibold">₹{totalAmount.toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={getStatusColor(order.orderStatus)}>
                            {order.orderStatus.toUpperCase()}
                          </Badge>
                          <Link href={`/orders/${order.id}`}>
                            <Button size="sm" variant="outline">
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Order Preview */}
                    <div className="p-6">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Package className="h-4 w-4" />
                        <span>Order Total: ₹{totalAmount.toFixed(2)}</span>
                      </div>

                      {order.trackingNumber && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            Tracking Number:{' '}
                            <span className="font-mono font-semibold">{order.trackingNumber}</span>
                          </p>
                        </div>
                      )}
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
