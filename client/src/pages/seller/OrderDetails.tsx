import { useState } from 'react';
import { useParams, Link } from 'wouter';
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  Truck,
  FileText,
  Loader2,
  Clock,
  Star,
} from 'lucide-react';
import {
  useSellerOrder,
  useUpdateOrderStatus,
  useCreateDelivery,
  useAssignDelivery,
  useAvailableDeliveryPartners,
  useDeliveryByOrder,
  useStoreDetails,
} from '@/hooks/seller';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SellerLayout } from '@/components/seller/navigation/SellerLayout';

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  processing: { label: 'Processing', color: 'bg-purple-100 text-purple-800', icon: Package },
  shipped: { label: 'Shipped', color: 'bg-indigo-100 text-indigo-800', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle },
};

export default function OrderDetails() {
  const { id } = useParams();
  const orderId = parseInt(id || '0', 10);

  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    action: 'accept' | 'reject' | null;
  }>({
    open: false,
    action: null,
  });
  const [assignPartnerDialog, setAssignPartnerDialog] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState<number | null>(null);

  const { data: orderData, isLoading: isLoadingOrder } = useSellerOrder(orderId);
  const { data: deliveryData, isLoading: isLoadingDelivery } = useDeliveryByOrder(orderId);
  const { data: storeData } = useStoreDetails();
  const { data: partnersData, isLoading: isLoadingPartners } = useAvailableDeliveryPartners(
    orderData?.data?.status === 'confirmed' && !deliveryData?.data
  );

  const updateOrderStatus = useUpdateOrderStatus();
  const createDelivery = useCreateDelivery();
  const assignDelivery = useAssignDelivery();

  const order = orderData?.data;
  const delivery = deliveryData?.data;
  const store = storeData?.data;
  const availablePartners = partnersData?.data || [];

  const handleStatusUpdate = async (status: 'confirmed' | 'cancelled') => {
    await updateOrderStatus.mutateAsync({ id: orderId, data: { status } });
    setActionDialog({ open: false, action: null });
  };

  const handleCreateDelivery = async () => {
    if (!order || !store) return;

    const address = order.address;
    await createDelivery.mutateAsync({
      orderId: order.id,
      pickupLocation: {
        address: `${store.address}, ${store.city}, ${store.state} - ${store.pincode}`,
        lat: 0, // TODO: Get actual coordinates
        lng: 0,
        contactName: store.storeName,
        contactPhone: store.contactNumber,
      },
      dropLocation: {
        address:
          `${address.addressLine1}, ${address.addressLine2 || ''}, ${address.city}, ${address.state} - ${address.postalCode}`.replace(
            /, ,/g,
            ','
          ),
        lat: 0, // TODO: Get actual coordinates
        lng: 0,
        contactName: address.fullName,
        contactPhone: address.phone,
      },
      buyerId: order.userId,
      deliveryFee: 50, // TODO: Calculate based on distance
    });
  };

  const handleAssignPartner = async () => {
    if (!delivery || !selectedPartnerId) return;
    await assignDelivery.mutateAsync({
      id: delivery.id,
      data: { deliveryPartnerId: selectedPartnerId },
    });
    setAssignPartnerDialog(false);
    setSelectedPartnerId(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
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

  if (isLoadingOrder) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex h-96 flex-col items-center justify-center">
        <Package className="mb-4 h-16 w-16 text-muted-foreground" />
        <h2 className="mb-2 text-2xl font-bold">Order Not Found</h2>
        <p className="mb-4 text-muted-foreground">The order you're looking for doesn't exist.</p>
        <Link href="/seller/orders">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
        </Link>
      </div>
    );
  }

  const config = statusConfig[order.status as keyof typeof statusConfig];
  const StatusIcon = config?.icon;

  return (
    <SellerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/seller/orders">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Order #{order.id}</h1>
              <p className="text-muted-foreground">Placed on {formatDate(order.createdAt)}</p>
            </div>
          </div>
          <Badge variant="secondary" className={`${config?.color} px-4 py-2 text-base`}>
            {StatusIcon && <StatusIcon className="mr-2 h-4 w-4" />}
            {config?.label}
          </Badge>
        </div>

        {/* Action Buttons */}
        {order.status === 'pending' && (
          <div className="flex gap-3">
            <Button
              onClick={() => setActionDialog({ open: true, action: 'accept' })}
              disabled={updateOrderStatus.isPending}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Accept Order
            </Button>
            <Button
              variant="destructive"
              onClick={() => setActionDialog({ open: true, action: 'reject' })}
              disabled={updateOrderStatus.isPending}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject Order
            </Button>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          {/* Left Column - Order Details */}
          <div className="space-y-6 md:col-span-2">
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Items
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.orderItems?.map((item: any) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg bg-muted">
                      {item.product?.thumbnail ? (
                        <img
                          src={item.product.thumbnail}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Package className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.product?.name || 'Product'}</h4>
                      {item.variant && (
                        <p className="text-sm text-muted-foreground">
                          {item.variant.color && `Color: ${item.variant.color}`}
                          {item.variant.color && item.variant.size && ' • '}
                          {item.variant.size && `Size: ${item.variant.size}`}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(item.price)}</p>
                      <p className="text-sm text-muted-foreground">each</p>
                    </div>
                  </div>
                ))}
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(order.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span>-{formatCurrency(order.discount || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span>{formatCurrency(delivery?.deliveryFee || 0)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>{formatCurrency(order.finalAmount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Section */}
            {order.status !== 'pending' && order.status !== 'cancelled' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Delivery Management
                  </CardTitle>
                  <CardDescription>
                    {!delivery
                      ? 'Create a delivery to start the fulfillment process'
                      : 'Manage delivery assignment and tracking'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoadingDelivery ? (
                    <Skeleton className="h-32 w-full" />
                  ) : !delivery ? (
                    <div className="py-6 text-center">
                      <Truck className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                      <p className="mb-4 text-muted-foreground">No delivery created yet</p>
                      <Button
                        onClick={handleCreateDelivery}
                        disabled={createDelivery.isPending || !store}
                      >
                        {createDelivery.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <Truck className="mr-2 h-4 w-4" />
                            Create Delivery
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Delivery Status</p>
                          <Badge className="mt-1">{delivery.status}</Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Delivery Fee</p>
                          <p className="font-semibold">{formatCurrency(delivery.deliveryFee)}</p>
                        </div>
                      </div>

                      {delivery.deliveryPartner ? (
                        <div className="space-y-2 rounded-lg border p-4">
                          <p className="font-semibold">Assigned to:</p>
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{delivery.deliveryPartner.user.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {delivery.deliveryPartner.vehicleType || 'N/A'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Contact</p>
                              <p className="font-medium">
                                {delivery.deliveryPartner.contactNumber}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : delivery.status === 'pending' ? (
                        <div className="py-4 text-center">
                          <p className="mb-4 text-muted-foreground">No delivery partner assigned</p>
                          <Button
                            onClick={() => setAssignPartnerDialog(true)}
                            disabled={assignDelivery.isPending}
                          >
                            <User className="mr-2 h-4 w-4" />
                            Assign Delivery Partner
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Customer & Address */}
          <div className="space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{order.buyer?.name || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{order.buyer?.email || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{order.address?.phone || 'N/A'}</span>
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
                <div className="space-y-2 text-sm">
                  <p className="font-semibold">{order.address?.fullName}</p>
                  <p>{order.address?.addressLine1}</p>
                  {order.address?.addressLine2 && <p>{order.address.addressLine2}</p>}
                  <p>
                    {order.address?.city}, {order.address?.state} - {order.address?.postalCode}
                  </p>
                  <div className="flex items-center gap-2 pt-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{order.address?.phone}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="font-medium">{order.paymentMethod || 'COD'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment Status</span>
                  <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                    {order.paymentStatus || 'pending'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Accept/Reject Dialog */}
        <AlertDialog
          open={actionDialog.open}
          onOpenChange={(open) => !open && setActionDialog({ open: false, action: null })}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {actionDialog.action === 'accept' ? 'Accept Order' : 'Reject Order'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {actionDialog.action === 'accept'
                  ? 'Are you sure you want to accept this order? You will need to fulfill it and create a delivery.'
                  : 'Are you sure you want to reject this order? This action cannot be undone and the customer will be notified.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  handleStatusUpdate(actionDialog.action === 'accept' ? 'confirmed' : 'cancelled')
                }
                className={
                  actionDialog.action === 'reject' ? 'bg-destructive hover:bg-destructive/90' : ''
                }
              >
                {actionDialog.action === 'accept' ? 'Accept Order' : 'Reject Order'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Assign Partner Dialog */}
        <Dialog open={assignPartnerDialog} onOpenChange={setAssignPartnerDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Assign Delivery Partner</DialogTitle>
              <DialogDescription>
                Select a verified delivery partner to assign this delivery
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-96 space-y-4 overflow-y-auto">
              {isLoadingPartners ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : availablePartners.length === 0 ? (
                <div className="py-8 text-center">
                  <User className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No available delivery partners at the moment
                  </p>
                </div>
              ) : (
                availablePartners.map((partner: any) => (
                  <div
                    key={partner.id}
                    className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                      selectedPartnerId === partner.id
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedPartnerId(partner.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{partner.user.name}</h4>
                          {partner.isVerified && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Verified
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {partner.vehicleType || 'Vehicle type not specified'}
                        </p>
                        <div className="mt-2 flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {partner.contactNumber}
                          </span>
                          {partner.rating && (
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              {partner.rating.toFixed(1)}
                            </span>
                          )}
                          {partner.completedDeliveries !== undefined && (
                            <span className="text-muted-foreground">
                              {partner.completedDeliveries} deliveries
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setAssignPartnerDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAssignPartner}
                disabled={!selectedPartnerId || assignDelivery.isPending}
              >
                {assignDelivery.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  'Assign Partner'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </SellerLayout>
  );
}
