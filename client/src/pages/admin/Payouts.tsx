import { useState, useMemo } from 'react';
import { AdminLayout } from '@/components/admin/navigation/AdminLayout';
import { useAllPayouts, useUpdatePayoutStatus } from '@/hooks/admin';
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  DollarSign,
  Wallet,
} from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { Payout } from '@/api/admin/payouts';

/**
 * Admin Payouts Management Page
 * View and manage all payout requests from delivery partners
 */

const PAYOUT_STATUSES = [
  { value: 'all', label: 'All Statuses' },
  { value: 'applied', label: 'Applied' },
  { value: 'processing', label: 'Processing' },
  { value: 'paid', label: 'Paid' },
  { value: 'rejected', label: 'Rejected' },
];

export default function AdminPayoutsPage() {
  // Filters state
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  // Dialog states
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [processingDialogOpen, setProcessingDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Build filters for API call
  const filters = useMemo(() => {
    const f: any = { page, limit };
    if (statusFilter !== 'all') f.status = statusFilter;
    return f;
  }, [statusFilter, page, limit]);

  // Fetch payouts
  const { data: payoutsData, isLoading } = useAllPayouts(filters);
  const payouts = payoutsData?.data || [];

  // Mutations
  const updateStatusMutation = useUpdatePayoutStatus();

  // Filter payouts by search query (client-side)
  const filteredPayouts = useMemo(() => {
    if (!searchQuery.trim()) return payouts;
    const query = searchQuery.toLowerCase();
    return payouts.filter(
      (payout) =>
        payout.id.toString().includes(query) ||
        payout.deliveryPartner?.name?.toLowerCase().includes(query) ||
        payout.deliveryPartner?.email?.toLowerCase().includes(query) ||
        payout.amount.includes(query)
    );
  }, [payouts, searchQuery]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalApplied = payouts.filter((p) => p.status === 'applied').length;
    const totalProcessing = payouts.filter((p) => p.status === 'processing').length;
    const totalPending = totalApplied + totalProcessing;
    const totalAmount = payouts
      .filter((p) => p.status === 'applied' || p.status === 'processing')
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);

    return { totalPending, totalApplied, totalProcessing, totalAmount };
  }, [payouts]);

  // Handlers
  const handleViewPayout = (payout: Payout) => {
    setSelectedPayout(payout);
    setViewDialogOpen(true);
  };

  const handleOpenApproveDialog = (payout: Payout) => {
    setSelectedPayout(payout);
    setApproveDialogOpen(true);
  };

  const handleOpenProcessingDialog = (payout: Payout) => {
    setSelectedPayout(payout);
    setProcessingDialogOpen(true);
  };

  const handleOpenRejectDialog = (payout: Payout) => {
    setSelectedPayout(payout);
    setRejectionReason('');
    setRejectDialogOpen(true);
  };

  const handleMarkProcessing = () => {
    if (!selectedPayout) return;

    updateStatusMutation.mutate(
      {
        id: selectedPayout.id,
        data: { status: 'processing' },
      },
      {
        onSuccess: () => {
          setProcessingDialogOpen(false);
          setSelectedPayout(null);
        },
      }
    );
  };

  const handleApprovePayout = () => {
    if (!selectedPayout) return;

    updateStatusMutation.mutate(
      {
        id: selectedPayout.id,
        data: { status: 'paid' },
      },
      {
        onSuccess: () => {
          setApproveDialogOpen(false);
          setSelectedPayout(null);
        },
      }
    );
  };

  const handleRejectPayout = () => {
    if (!selectedPayout || !rejectionReason.trim()) return;

    updateStatusMutation.mutate(
      {
        id: selectedPayout.id,
        data: { status: 'rejected', rejectionReason },
      },
      {
        onSuccess: () => {
          setRejectDialogOpen(false);
          setSelectedPayout(null);
          setRejectionReason('');
        },
      }
    );
  };

  // Render status badge
  const renderStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
      applied: 'default',
      processing: 'secondary',
      paid: 'outline',
      rejected: 'destructive',
    };

    const colors: Record<string, string> = {
      applied: 'bg-blue-100 text-blue-800 border-blue-200',
      processing: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      paid: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
    };

    return (
      <Badge variant={variants[status] || 'outline'} className={`capitalize ${colors[status]}`}>
        {status}
      </Badge>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payout Management</h1>
          <p className="text-muted-foreground">Manage payout requests from delivery partners</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPending}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalApplied} applied, {stats.totalProcessing} processing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalAmount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total pending payouts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Applied</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalApplied}</div>
              <p className="text-xs text-muted-foreground">New requests</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processing</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProcessing}</div>
              <p className="text-xs text-muted-foreground">Being processed</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {/* Search */}
              <div>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by ID, name, email, or amount..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  {PAYOUT_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Payouts Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Payouts ({filteredPayouts.length})</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredPayouts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground">No payouts found</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Try adjusting your filters or search query
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">ID</TableHead>
                        <TableHead>Partner</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Applied Date</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPayouts.map((payout) => (
                        <TableRow key={payout.id}>
                          <TableCell className="font-medium">#{payout.id}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {payout.deliveryPartner?.name || 'N/A'}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {payout.deliveryPartner?.email || 'N/A'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">
                            ₹{parseFloat(payout.amount).toLocaleString()}
                          </TableCell>
                          <TableCell>{renderStatusBadge(payout.status)}</TableCell>
                          <TableCell>{new Date(payout.appliedAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewPayout(payout)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                {payout.status === 'applied' && (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() => handleOpenProcessingDialog(payout)}
                                    >
                                      <Clock className="mr-2 h-4 w-4" />
                                      Mark Processing
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleOpenApproveDialog(payout)}
                                      className="text-green-600"
                                    >
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      Approve & Pay
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleOpenRejectDialog(payout)}
                                      className="text-red-600"
                                    >
                                      <XCircle className="mr-2 h-4 w-4" />
                                      Reject
                                    </DropdownMenuItem>
                                  </>
                                )}
                                {payout.status === 'processing' && (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() => handleOpenApproveDialog(payout)}
                                      className="text-green-600"
                                    >
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      Approve & Pay
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleOpenRejectDialog(payout)}
                                      className="text-red-600"
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
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {filteredPayouts.length} payout(s)
                  </div>
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
                    <span className="text-sm">Page {page}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={filteredPayouts.length < limit}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Payout Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payout Details #{selectedPayout?.id}</DialogTitle>
            <DialogDescription>
              {selectedPayout && renderStatusBadge(selectedPayout.status)}
            </DialogDescription>
          </DialogHeader>
          {selectedPayout && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold">Delivery Partner</Label>
                  <p className="mt-1 text-sm">{selectedPayout.deliveryPartner?.name || 'N/A'}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedPayout.deliveryPartner?.email || 'N/A'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Amount</Label>
                  <p className="mt-1 text-sm font-semibold">
                    ₹{parseFloat(selectedPayout.amount).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-sm font-semibold">Applied Date</Label>
                  <p className="mt-1 text-sm">
                    {new Date(selectedPayout.appliedAt).toLocaleString()}
                  </p>
                </div>
                {selectedPayout.processedAt && (
                  <div>
                    <Label className="text-sm font-semibold">Processed Date</Label>
                    <p className="mt-1 text-sm">
                      {new Date(selectedPayout.processedAt).toLocaleString()}
                    </p>
                  </div>
                )}
                {selectedPayout.paidAt && (
                  <div>
                    <Label className="text-sm font-semibold">Paid Date</Label>
                    <p className="mt-1 text-sm">
                      {new Date(selectedPayout.paidAt).toLocaleString()}
                    </p>
                  </div>
                )}
                {selectedPayout.rejectedAt && (
                  <div>
                    <Label className="text-sm font-semibold">Rejected Date</Label>
                    <p className="mt-1 text-sm">
                      {new Date(selectedPayout.rejectedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
              {selectedPayout.rejectionReason && (
                <div>
                  <Label className="text-sm font-semibold">Rejection Reason</Label>
                  <p className="mt-1 rounded border border-red-200 bg-red-50 p-3 text-sm">
                    {selectedPayout.rejectionReason}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Mark Processing Dialog */}
      <AlertDialog open={processingDialogOpen} onOpenChange={setProcessingDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark as Processing</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark payout #{selectedPayout?.id} (₹
              {selectedPayout && parseFloat(selectedPayout.amount).toLocaleString()}) as processing?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleMarkProcessing}>Mark Processing</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Approve Payout Dialog */}
      <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Payout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve and pay payout #{selectedPayout?.id} (₹
              {selectedPayout && parseFloat(selectedPayout.amount).toLocaleString()}) to{' '}
              {selectedPayout?.deliveryPartner?.name}?
              <br />
              <br />
              This action will deduct the amount from the partner's wallet and mark the payout as
              paid.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprovePayout}
              className="bg-green-600 hover:bg-green-700"
            >
              Approve & Pay
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Payout Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Payout</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting payout #{selectedPayout?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Rejection Reason *</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRejectPayout}
              disabled={!rejectionReason.trim() || updateStatusMutation.isPending}
              variant="destructive"
            >
              Reject Payout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
