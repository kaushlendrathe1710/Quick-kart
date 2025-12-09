import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/navigation/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { toast } from 'sonner';
import { CheckCircle, XCircle, Eye, FileText, Clock, Users, Truck } from 'lucide-react';
import apiClient from '@/api/apiClient';

/**
 * Admin Applications Page
 * Review and approve/reject seller and delivery partner applications
 */

interface Application {
  id: number;
  userId: number;
  businessName?: string;
  fullName?: string;
  email: string;
  phone: string;
  businessAddress?: string;
  address?: string;
  gstNumber?: string;
  panNumber?: string;
  vehicleType?: string;
  vehicleNumber?: string;
  documentsSubmitted: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  createdAt: string;
  reviewedAt?: string;
  documents?: any; // For seller: array, for delivery: object
}

export default function AdminApplicationsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('seller');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Fetch seller applications
  const { data: sellerApps, isLoading: loadingSellers } = useQuery({
    queryKey: ['admin-seller-applications'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/applications/sellers');
      return response.data.data;
    },
  });

  // Fetch delivery partner applications
  const { data: deliveryApps, isLoading: loadingDelivery } = useQuery({
    queryKey: ['admin-delivery-applications'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/applications/delivery-partners');
      return response.data.data;
    },
  });

  // Approve application mutation
  const approveApplicationMutation = useMutation({
    mutationFn: async ({ id, type }: { id: number; type: 'seller' | 'delivery' }) => {
      const endpoint =
        type === 'seller'
          ? `/admin/applications/sellers/${id}/approve`
          : `/admin/applications/delivery-partners/${id}/approve`;
      const response = await apiClient.post(endpoint);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Application approved successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-seller-applications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-delivery-applications'] });
      setApproveDialogOpen(false);
      setViewDialogOpen(false);
      setSelectedApplication(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || 'Failed to approve application');
    },
  });

  // Reject application mutation
  const rejectApplicationMutation = useMutation({
    mutationFn: async ({
      id,
      type,
      reason,
    }: {
      id: number;
      type: 'seller' | 'delivery';
      reason: string;
    }) => {
      const endpoint =
        type === 'seller'
          ? `/admin/applications/sellers/${id}/reject`
          : `/admin/applications/delivery-partners/${id}/reject`;
      const response = await apiClient.post(endpoint, { adminNotes: reason });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Application rejected');
      queryClient.invalidateQueries({ queryKey: ['admin-seller-applications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-delivery-applications'] });
      setRejectDialogOpen(false);
      setViewDialogOpen(false);
      setSelectedApplication(null);
      setRejectionReason('');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || 'Failed to reject application');
    },
  });

  const handleViewApplication = (application: Application) => {
    setSelectedApplication(application);
    setViewDialogOpen(true);
  };

  const handleApprove = () => {
    if (!selectedApplication) return;

    approveApplicationMutation.mutate({
      id: selectedApplication.id,
      type: activeTab as 'seller' | 'delivery',
    });
  };

  const handleReject = () => {
    if (!selectedApplication || !rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    rejectApplicationMutation.mutate({
      id: selectedApplication.id,
      type: activeTab as 'seller' | 'delivery',
      reason: rejectionReason,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-600">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const sellerApplications = (sellerApps || []) as Application[];
  const deliveryApplications = (deliveryApps || []) as Application[];

  const pendingSellerCount = sellerApplications.filter((app) => app.status === 'pending').length;
  const pendingDeliveryCount = deliveryApplications.filter(
    (app) => app.status === 'pending'
  ).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Application Management</h1>
          <p className="text-muted-foreground">
            Review and approve seller and delivery partner applications
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Seller Applications</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingSellerCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Delivery Applications</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingDeliveryCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingSellerCount + pendingDeliveryCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Applications Table */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="seller">
              Seller Applications ({sellerApplications.length})
            </TabsTrigger>
            <TabsTrigger value="delivery">
              Delivery Partner Applications ({deliveryApplications.length})
            </TabsTrigger>
          </TabsList>

          {/* Seller Applications */}
          <TabsContent value="seller" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Seller Applications</CardTitle>
                <CardDescription>Review and manage seller account applications</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingSellers ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : sellerApplications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-lg font-medium">No Applications Found</p>
                    <p className="text-sm text-muted-foreground">
                      Seller applications will appear here
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Business Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>GST Number</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Applied On</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sellerApplications.map((app) => (
                        <TableRow key={app.id}>
                          <TableCell className="font-medium">{app.businessName}</TableCell>
                          <TableCell>{app.email}</TableCell>
                          <TableCell>{app.gstNumber}</TableCell>
                          <TableCell>{getStatusBadge(app.status)}</TableCell>
                          <TableCell>{new Date(app.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewApplication(app)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Delivery Partner Applications */}
          <TabsContent value="delivery" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Partner Applications</CardTitle>
                <CardDescription>
                  Review and manage delivery partner account applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingDelivery ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : deliveryApplications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-lg font-medium">No Applications Found</p>
                    <p className="text-sm text-muted-foreground">
                      Delivery partner applications will appear here
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Vehicle</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Applied On</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deliveryApplications.map((app) => (
                        <TableRow key={app.id}>
                          <TableCell className="font-medium">{app.fullName}</TableCell>
                          <TableCell>{app.email}</TableCell>
                          <TableCell>{app.phone}</TableCell>
                          <TableCell>{app.vehicleType || 'N/A'}</TableCell>
                          <TableCell>{getStatusBadge(app.status)}</TableCell>
                          <TableCell>{new Date(app.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewApplication(app)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* View Application Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {activeTab === 'seller' ? 'Seller' : 'Delivery Partner'} Application Details
            </DialogTitle>
            <DialogDescription>Review application details and take action</DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                <div>
                  <p className="text-sm text-gray-600">Application Status</p>
                  <div className="mt-1">{getStatusBadge(selectedApplication.status)}</div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Applied On</p>
                  <p className="mt-1 font-medium">
                    {new Date(selectedApplication.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Application Details */}
              <div className="grid gap-4 md:grid-cols-2">
                {activeTab === 'seller' ? (
                  <>
                    <div>
                      <Label className="text-gray-600">Business Name</Label>
                      <p className="mt-1 font-medium">{selectedApplication.businessName}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Email</Label>
                      <p className="mt-1 font-medium">{selectedApplication.email}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Phone</Label>
                      <p className="mt-1 font-medium">{selectedApplication.phone}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">GST Number</Label>
                      <p className="mt-1 font-medium">{selectedApplication.gstNumber}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">PAN Number</Label>
                      <p className="mt-1 font-medium">{selectedApplication.panNumber}</p>
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-gray-600">Business Address</Label>
                      <p className="mt-1 font-medium">{selectedApplication.businessAddress}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <Label className="text-gray-600">Full Name</Label>
                      <p className="mt-1 font-medium">{selectedApplication.fullName}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Email</Label>
                      <p className="mt-1 font-medium">{selectedApplication.email}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Phone</Label>
                      <p className="mt-1 font-medium">{selectedApplication.phone}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Vehicle Type</Label>
                      <p className="mt-1 font-medium">{selectedApplication.vehicleType || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Vehicle Number</Label>
                      <p className="mt-1 font-medium">
                        {selectedApplication.vehicleNumber || 'N/A'}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-gray-600">Address</Label>
                      <p className="mt-1 font-medium">{selectedApplication.address}</p>
                    </div>
                  </>
                )}
              </div>

              {/* Documents */}
              <div>
                <Label className="text-lg font-semibold text-gray-900">Documents Submitted</Label>
                <div className="mt-3 space-y-3">
                  {activeTab === 'seller' &&
                  selectedApplication.documents &&
                  Array.isArray(selectedApplication.documents) &&
                  selectedApplication.documents.length > 0 ? (
                    <div className="grid gap-3">
                      {selectedApplication.documents.map((doc: any) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            <div className="rounded-full bg-blue-100 p-2">
                              <FileText className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{doc.documentName}</p>
                              <p className="text-sm capitalize text-gray-500">
                                {doc.documentType?.replace(/_/g, ' ')}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(doc.documentUrl, '_blank')}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Document
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : activeTab === 'delivery' && selectedApplication.documents ? (
                    <div className="grid gap-3">
                      {selectedApplication.documents.aadharCard && (
                        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="rounded-full bg-blue-100 p-2">
                              <FileText className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Aadhar Card</p>
                              <p className="text-sm text-gray-500">
                                {selectedApplication.documents.aadharNumber || 'No number provided'}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              window.open(selectedApplication.documents.aadharCard, '_blank')
                            }
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Button>
                        </div>
                      )}
                      {selectedApplication.documents.panCard && (
                        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="rounded-full bg-blue-100 p-2">
                              <FileText className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">PAN Card</p>
                              <p className="text-sm text-gray-500">
                                {selectedApplication.documents.panNumber || 'No number provided'}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              window.open(selectedApplication.documents.panCard, '_blank')
                            }
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Button>
                        </div>
                      )}
                      {selectedApplication.documents.drivingLicense && (
                        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="rounded-full bg-blue-100 p-2">
                              <FileText className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Driving License</p>
                              <p className="text-sm text-gray-500">
                                {selectedApplication.documents.licenseNumber ||
                                  'No number provided'}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              window.open(selectedApplication.documents.drivingLicense, '_blank')
                            }
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Button>
                        </div>
                      )}
                      {selectedApplication.documents.vehicleRegistration && (
                        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="rounded-full bg-blue-100 p-2">
                              <FileText className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Vehicle Registration</p>
                              <p className="text-sm text-gray-500">RC Document</p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              window.open(
                                selectedApplication.documents.vehicleRegistration,
                                '_blank'
                              )
                            }
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Button>
                        </div>
                      )}
                      {selectedApplication.documents.insuranceCertificate && (
                        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="rounded-full bg-blue-100 p-2">
                              <FileText className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Insurance Certificate</p>
                              <p className="text-sm text-gray-500">Vehicle Insurance</p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              window.open(
                                selectedApplication.documents.insuranceCertificate,
                                '_blank'
                              )
                            }
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-lg bg-gray-50 p-4 text-center">
                      <p className="text-sm text-gray-500">No documents uploaded yet</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Admin Notes (if rejected) */}
              {selectedApplication.adminNotes && (
                <div className="rounded-lg bg-red-50 p-4">
                  <Label className="text-red-900">Rejection Reason</Label>
                  <p className="mt-1 text-red-800">{selectedApplication.adminNotes}</p>
                </div>
              )}

              {/* Actions */}
              {selectedApplication.status === 'pending' && (
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setRejectDialogOpen(true);
                    }}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => {
                      setApproveDialogOpen(true);
                    }}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approve Confirmation Dialog */}
      <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Application</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this application? The user will be granted access to
              the {activeTab === 'seller' ? 'seller' : 'delivery partner'} dashboard and all
              features.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprove}
              disabled={approveApplicationMutation.isPending}
            >
              {approveApplicationMutation.isPending ? 'Approving...' : 'Approve'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Application</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting this application. This will be shown to the
              user.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4">
            <Textarea
              placeholder="Reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={!rejectionReason.trim() || rejectApplicationMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {rejectApplicationMutation.isPending ? 'Rejecting...' : 'Reject Application'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
