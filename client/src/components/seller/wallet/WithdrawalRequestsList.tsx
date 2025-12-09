import { format } from 'date-fns';
import { Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
import { useSellerWallet } from '@/hooks/seller';

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

export function WithdrawalRequestsList() {
  const { useWithdrawalRequests } = useSellerWallet();
  const { data: withdrawalData, isLoading: isLoadingWithdrawalRequests } = useWithdrawalRequests(
    1,
    20
  );
  const withdrawalRequests = withdrawalData?.withdrawalRequests || [];

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
          <CardTitle>Withdrawal Requests</CardTitle>
          <CardDescription>View your withdrawal request history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Clock className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No withdrawal requests</h3>
            <p className="text-sm text-muted-foreground">
              Your withdrawal requests will appear here once you submit them
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Withdrawal Requests</CardTitle>
        <CardDescription>
          View and track your withdrawal request history ({withdrawalRequests.length} total)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Request Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Processed Date</TableHead>
              <TableHead>Admin Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {withdrawalRequests.map((request: any) => {
              const statusInfo = statusConfig[request.status as keyof typeof statusConfig];
              const StatusIcon = statusInfo.icon;

              let accountInfo = '';
              try {
                const details = JSON.parse(request.accountDetails);
                if (request.paymentMethod === 'bank_transfer') {
                  accountInfo = `${details.bankName} - ${details.accountNumber.slice(-4)}`;
                } else {
                  accountInfo = details.upiId;
                }
              } catch (e) {
                accountInfo = 'Account details';
              }

              return (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">
                    {format(new Date(request.requestedAt), 'dd MMM yyyy, hh:mm a')}
                  </TableCell>
                  <TableCell className="font-semibold">
                    ₹{parseFloat(request.amount).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="capitalize">{request.paymentMethod.replace('_', ' ')}</span>
                      <span className="text-xs text-muted-foreground">{accountInfo}</span>
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
                    {request.processedAt
                      ? format(new Date(request.processedAt), 'dd MMM yyyy')
                      : '-'}
                  </TableCell>
                  <TableCell className="max-w-xs">
                    {request.adminNotes ? (
                      <span className="text-sm">{request.adminNotes}</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
