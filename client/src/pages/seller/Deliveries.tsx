import { useState } from 'react';
import { Link } from 'wouter';
import { SellerLayout } from '@/components/seller/navigation/SellerLayout';
import {
  Search,
  Filter,
  Truck,
  MapPin,
  User,
  Phone,
  Eye,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Package,
} from 'lucide-react';
import { useSellerDeliveries, useCancelDelivery } from '@/hooks/seller';
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

type DeliveryStatus =
  | 'all'
  | 'pending'
  | 'assigned'
  | 'in_progress'
  | 'picked_up'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  assigned: { label: 'Assigned', color: 'bg-blue-100 text-blue-800' },
  in_progress: { label: 'In Progress', color: 'bg-purple-100 text-purple-800' },
  picked_up: { label: 'Picked Up', color: 'bg-indigo-100 text-indigo-800' },
  out_for_delivery: { label: 'Out for Delivery', color: 'bg-orange-100 text-orange-800' },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
};

export default function Deliveries() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<DeliveryStatus>('all');
  const [page, setPage] = useState(1);
  const [cancelDialog, setCancelDialog] = useState<{
    open: boolean;
    deliveryId: number | null;
  }>({
    open: false,
    deliveryId: null,
  });

  const limit = 10;

  const { data: deliveriesData, isLoading } = useSellerDeliveries({
    page,
    limit,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const cancelDelivery = useCancelDelivery();

  const deliveries = deliveriesData?.data || [];
  const totalPages = deliveriesData?.pagination?.totalPages || 1;

  const handleCancelDelivery = async () => {
    if (!cancelDialog.deliveryId) return;
    await cancelDelivery.mutateAsync({
      id: cancelDialog.deliveryId,
      reason: 'Cancelled by seller',
    });
    setCancelDialog({ open: false, deliveryId: null });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number | string) => {
    return `₹${Number(amount).toLocaleString('en-IN')}`;
  };

  // Filter deliveries by search query
  const filteredDeliveries = deliveries.filter((delivery: any) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      delivery.id.toString().includes(query) ||
      delivery.orderId.toString().includes(query) ||
      delivery.deliveryPartner?.user?.name?.toLowerCase().includes(query)
    );
  });

  return (
    <SellerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deliveries</h1>
          <p className="text-muted-foreground">Track and manage all your deliveries</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Package className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {deliveries.filter((d: any) => d.status === 'pending').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Transit</CardTitle>
              <Truck className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  deliveries.filter((d: any) =>
                    ['assigned', 'in_progress', 'picked_up', 'out_for_delivery'].includes(d.status)
                  ).length
                }
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivered</CardTitle>
              <Package className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {deliveries.filter((d: any) => d.status === 'delivered').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {deliveries.filter((d: any) => d.status === 'cancelled').length}
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
                  placeholder="Search by delivery ID, order ID, or partner name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as DeliveryStatus)}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Deliveries</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="picked_up">Picked Up</SelectItem>
                  <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Deliveries Table */}
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredDeliveries.length === 0 ? (
              <div className="py-12 text-center">
                <Truck className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No deliveries found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery || statusFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Deliveries will appear here once you create them for orders'}
                </p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Delivery ID</TableHead>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Delivery Partner</TableHead>
                      <TableHead>Pickup Location</TableHead>
                      <TableHead>Drop Location</TableHead>
                      <TableHead>Fee</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDeliveries.map((delivery: any) => {
                      const config = statusConfig[delivery.status as keyof typeof statusConfig];

                      return (
                        <TableRow key={delivery.id}>
                          <TableCell className="font-medium">#{delivery.id}</TableCell>
                          <TableCell>
                            <Link href={`/seller/orders/${delivery.orderId}`}>
                              <Button variant="link" className="h-auto p-0">
                                #{delivery.orderId}
                              </Button>
                            </Link>
                          </TableCell>
                          <TableCell>
                            {delivery.deliveryPartner ? (
                              <div>
                                <p className="font-medium">{delivery.deliveryPartner.user.name}</p>
                                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Phone className="h-3 w-3" />
                                  {delivery.deliveryPartner.contactNumber}
                                </p>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">Not assigned</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex max-w-[200px] items-start gap-1">
                              <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                              <span className="truncate text-sm">
                                {delivery.pickupLocation.address}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex max-w-[200px] items-start gap-1">
                              <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                              <span className="truncate text-sm">
                                {delivery.dropLocation.address}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(delivery.deliveryFee)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={config?.color}>
                              {config?.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="space-x-2 text-right">
                            <Link href={`/seller/orders/${delivery.orderId}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="mr-1 h-4 w-4" />
                                View Order
                              </Button>
                            </Link>
                            {delivery.status !== 'delivered' && delivery.status !== 'cancelled' && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() =>
                                  setCancelDialog({ open: true, deliveryId: delivery.id })
                                }
                              >
                                <XCircle className="mr-1 h-4 w-4" />
                                Cancel
                              </Button>
                            )}
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

        {/* Cancel Confirmation Dialog */}
        <AlertDialog
          open={cancelDialog.open}
          onOpenChange={(open) => !open && setCancelDialog({ open: false, deliveryId: null })}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Delivery</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel this delivery? This action cannot be undone and the
                delivery partner will be notified.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>No, keep it</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleCancelDelivery}
                className="bg-destructive hover:bg-destructive/90"
              >
                Yes, cancel delivery
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </SellerLayout>
  );
}
