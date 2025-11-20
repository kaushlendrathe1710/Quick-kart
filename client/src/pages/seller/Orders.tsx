import { useState } from 'react';
import { useLocation } from 'wouter';
import {
  Search,
  Filter,
  Package,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
} from 'lucide-react';
import { useSellerOrders, useUpdateOrderStatus } from '@/hooks/seller';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { SellerLayout } from '@/components/seller/navigation/SellerLayout';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type OrderStatus =
  | 'all'
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

const statusConfig = {
  pending: {
    label: 'Pending',
    variant: 'secondary' as const,
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
  },
  confirmed: {
    label: 'Confirmed',
    variant: 'default' as const,
    color: 'bg-blue-100 text-blue-800',
    icon: CheckCircle,
  },
  processing: {
    label: 'Processing',
    variant: 'default' as const,
    color: 'bg-purple-100 text-purple-800',
    icon: Package,
  },
  shipped: {
    label: 'Shipped',
    variant: 'default' as const,
    color: 'bg-indigo-100 text-indigo-800',
    icon: Truck,
  },
  delivered: {
    label: 'Delivered',
    variant: 'default' as const,
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'Cancelled',
    variant: 'destructive' as const,
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
  },
};

export default function Orders() {
  const [location, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus>('all');
  const [page, setPage] = useState(1);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    orderId: number | null;
    action: 'accept' | 'reject' | null;
  }>({
    open: false,
    orderId: null,
    action: null,
  });

  const limit = 10;

  const { data: ordersData, isLoading } = useSellerOrders({
    page,
    limit,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const updateOrderStatus = useUpdateOrderStatus();

  const orders = ordersData?.data || [];
  const totalPages = ordersData?.pagination?.totalPages || 1;

  const handleStatusUpdate = async (orderId: number, status: 'confirmed' | 'cancelled') => {
    await updateOrderStatus.mutateAsync({ id: orderId, data: { status } });
    setActionDialog({ open: false, orderId: null, action: null });
  };

  const openActionDialog = (orderId: number, action: 'accept' | 'reject') => {
    setActionDialog({ open: true, orderId, action });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number | string) => {
    return `₹${Number(amount).toLocaleString('en-IN')}`;
  };

  return (
    <SellerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">Manage and track all your orders</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {orders.filter((o: any) => o.status === 'pending').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processing</CardTitle>
              <Package className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {orders.filter((o: any) => ['confirmed', 'processing'].includes(o.status)).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Shipped</CardTitle>
              <Truck className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {orders.filter((o: any) => o.status === 'shipped').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivered</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {orders.filter((o: any) => o.status === 'delivered').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by order ID or customer name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as OrderStatus)}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="py-12 text-center">
                <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No orders found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery || statusFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Orders will appear here once customers place them'}
                </p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order: any) => {
                      const config = statusConfig[order.orderStatus as keyof typeof statusConfig];
                      const StatusIcon = config?.icon;

                      return (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">#{order.id}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{order.buyer?.name || 'N/A'}</p>
                              <p className="text-sm text-muted-foreground">{order.buyer?.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(order.createdAt)}</TableCell>
                          <TableCell>{order.orderItems?.length || 0} items</TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(order.finalAmount)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={config?.variant} className={config?.color}>
                              {StatusIcon && <StatusIcon className="mr-1 h-3 w-3" />}
                              {config?.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="space-x-2 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>

                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onSelect={() => {
                                    navigate(`/seller/orders/${order.id}`);
                                  }}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View
                                </DropdownMenuItem>
                                {order.orderStatus === 'pending' && (
                                  <>
                                    <DropdownMenuItem
                                      onSelect={() => openActionDialog(order.id, 'accept')}
                                    >
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      Accept
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                      className="text-destructive focus:text-destructive"
                                      onSelect={() => openActionDialog(order.id, 'reject')}
                                    >
                                      <XCircle className="mr-2 h-4 w-4" />
                                      Reject
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Page {page} of {totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Accept/Reject Confirmation Dialog */}
        <AlertDialog
          open={actionDialog.open}
          onOpenChange={(open: boolean) =>
            !open && setActionDialog({ open: false, orderId: null, action: null })
          }
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {actionDialog.action === 'accept' ? 'Accept Order' : 'Reject Order'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {actionDialog.action === 'accept'
                  ? 'Are you sure you want to accept this order? You will need to fulfill it and arrange delivery.'
                  : 'Are you sure you want to reject this order? This action cannot be undone and the customer will be notified.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (actionDialog.orderId) {
                    handleStatusUpdate(
                      actionDialog.orderId,
                      actionDialog.action === 'accept' ? 'confirmed' : 'cancelled'
                    );
                  }
                }}
                className={
                  actionDialog.action === 'reject' ? 'bg-destructive hover:bg-destructive/90' : ''
                }
              >
                {actionDialog.action === 'accept' ? 'Accept Order' : 'Reject Order'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </SellerLayout>
  );
}
