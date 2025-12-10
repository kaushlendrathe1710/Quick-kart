import { useState } from 'react';
import { format } from 'date-fns';
import { Clock, CheckCircle2, XCircle, AlertCircle, User, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAdminWithdrawals } from '@/hooks/admin';
import type { WithdrawalRequest } from '@shared/types';

const statusConfig = {
  pending: {
    label: 'Pending',
    variant: 'secondary' as const,
    icon: Clock,
  },
  approved: {
    label: 'Approved',
    variant: 'default' as const,
    icon: CheckCircle2,
  },
  rejected: {
    label: 'Rejected',
    variant: 'destructive' as const,
    icon: XCircle,
  },
  processing: {
    label: 'Processing',
    variant: 'outline' as const,
    icon: AlertCircle,
  },
  completed: {
    label: 'Completed',
    variant: 'success' as const,
    icon: CheckCircle2,
  },
};

type ActionType = 'approve' | 'reject' | 'complete' | null;

export function AdminWithdrawalManagement() {
  const {
    useWithdrawalList,
    approveWithdrawal,
    rejectWithdrawal,
    completeWithdrawal,
    isApprovingWithdrawal,
    isRejectingWithdrawal,
    isCompletingWithdrawal,
  } = useAdminWithdrawals();

  const { data: withdrawalData, isLoading: isLoadingWithdrawalRequests } = useWithdrawalList(1, 50);
  const withdrawalRequests = withdrawalData?.withdrawalRequests || [];

  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
  const [actionType, setActionType] = useState<ActionType>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [razorpayPayoutId, setRazorpayPayoutId] = useState('');

  const isProcessing = isApprovingWithdrawal || isRejectingWithdrawal || isCompletingWithdrawal;

  const handleAction = async () => {
    if (!selectedRequest || !actionType) return;

    try {
      if (actionType === 'approve') {
        await approveWithdrawal({ id: selectedRequest.id, data: { adminNotes } });
      } else if (actionType === 'reject') {
        await rejectWithdrawal({
          id: selectedRequest.id,
          data: { adminNotes, rejectionReason: adminNotes },
        });
      } else if (actionType === 'complete') {
        await completeWithdrawal({
          id: selectedRequest.id,
          data: { razorpayPayoutId, adminNotes },
        });
      }
      closeDialog();
    } catch (error) {
      console.error('Action failed:', error);
    }
  };

  const closeDialog = () => {
    setSelectedRequest(null);
    setActionType(null);
    setAdminNotes('');
    setRazorpayPayoutId('');
  };

  const openActionDialog = (request: WithdrawalRequest, action: ActionType) => {
    setSelectedRequest(request);
    setActionType(action);
  };

  if (isLoadingWithdrawalRequests) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!withdrawalRequests || withdrawalRequests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal Requests Management</CardTitle>
          <CardDescription>Review and manage withdrawal requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Clock className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No withdrawal requests</h3>
            <p className="text-sm text-muted-foreground">
              Withdrawal requests will appear here for review
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal Requests Management</CardTitle>
          <CardDescription>
            Review and manage withdrawal requests ({withdrawalRequests.length} total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Request Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Details</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {withdrawalRequests.map((request: any) => {
                const statusInfo = statusConfig[request.status as keyof typeof statusConfig];
                const StatusIcon = statusInfo.icon;

                let accountDetails = { method: '', info: '' };
                try {
                  const details = JSON.parse(request.accountDetails);
                  if (request.paymentMethod === 'bank_transfer') {
                    accountDetails = {
                      method: 'Bank Transfer',
                      info: `${details.accountHolderName} - ${details.bankName} (${details.accountNumber.slice(-4)})`,
                    };
                  } else {
                    accountDetails = {
                      method: 'UPI',
                      info: `${details.upiHolderName} - ${details.upiId}`,
                    };
                  }
                } catch (e) {
                  accountDetails = { method: 'Unknown', info: 'Details unavailable' };
                }

                return (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {request.userType === 'seller' ? (
                          <Building2 className="h-4 w-4 text-blue-500" />
                        ) : (
                          <User className="h-4 w-4 text-green-500" />
                        )}
                        <div>
                          <div className="font-medium">User #{request.userId}</div>
                          <div className="text-xs capitalize text-muted-foreground">
                            {request.userType}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(request.requestedAt), 'dd MMM yyyy, hh:mm a')}
                    </TableCell>
                    <TableCell className="font-semibold">
                      ₹{parseFloat(request.amount).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{accountDetails.method}</span>
                        <span className="text-xs text-muted-foreground">{accountDetails.info}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={statusInfo.variant === 'success' ? 'default' : statusInfo.variant}
                        className="flex w-fit items-center gap-1"
                      >
                        <StatusIcon className="h-3 w-3" />
                        {statusInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {request.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => openActionDialog(request, 'approve')}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => openActionDialog(request, 'reject')}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {request.status === 'approved' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openActionDialog(request, 'complete')}
                          >
                            Mark Complete
                          </Button>
                        )}
                        {['rejected', 'completed'].includes(request.status) && (
                          <span className="text-sm text-muted-foreground">No actions</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedRequest && !!actionType} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' && 'Approve Withdrawal Request'}
              {actionType === 'reject' && 'Reject Withdrawal Request'}
              {actionType === 'complete' && 'Complete Withdrawal'}
            </DialogTitle>
            <DialogDescription>
              {selectedRequest && (
                <>
                  Amount: ₹{parseFloat(selectedRequest.amount).toFixed(2)} | User #
                  {selectedRequest.userId} ({selectedRequest.userType})
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {actionType === 'complete' && (
              <div className="space-y-2">
                <Label htmlFor="razorpayPayoutId">Razorpay Payout ID</Label>
                <input
                  id="razorpayPayoutId"
                  value={razorpayPayoutId}
                  onChange={(e) => setRazorpayPayoutId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="pout_xxxxxxxxxxxxx"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="adminNotes">Admin Notes</Label>
              <Textarea
                id="adminNotes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add notes about this action..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={isProcessing}>
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              disabled={isProcessing || (actionType === 'complete' && !razorpayPayoutId)}
              variant={actionType === 'reject' ? 'destructive' : 'default'}
            >
              {isProcessing ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {actionType === 'approve' && 'Approve Request'}
                  {actionType === 'reject' && 'Reject Request'}
                  {actionType === 'complete' && 'Mark as Complete'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
