import { ReactNode } from 'react';
import { Link } from 'wouter';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Clock, XCircle, FileText } from 'lucide-react';
import { useSellerApprovalStatus } from '@/hooks/seller';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Seller Approval Check Component
 * Shows approval status and restricts access to unapproved sellers
 */

interface ApprovalCheckProps {
  children: ReactNode;
  showAlways?: boolean;
}

export function ApprovalCheck({ children, showAlways = false }: ApprovalCheckProps) {
  const { data: statusData, isLoading } = useSellerApprovalStatus();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const status = (statusData as any)?.data;
  const isApproved = status?.isApproved;

  // Show content if approved (or if showAlways is true)
  if (isApproved || showAlways) {
    return (
      <>
        {!isApproved && (
          <Alert variant="default" className="mb-6 border-yellow-200 bg-yellow-50">
            <Clock className="h-4 w-4" />
            <AlertTitle>Account Pending Approval</AlertTitle>
            <AlertDescription className="mt-2 space-y-2">
              <p>
                Your seller account is currently under review. Some features may be restricted until
                approval is complete.
              </p>
              <Link href="/seller/application">
                <Button variant="outline" size="sm" className="mt-2">
                  <FileText className="mr-2 h-4 w-4" />
                  View Application Status
                </Button>
              </Link>
            </AlertDescription>
          </Alert>
        )}
        {children}
      </>
    );
  }

  // Show pending/rejected status
  return (
    <div className="container mx-auto max-w-2xl py-12">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {status?.status === 'pending' && (
              <>
                <Clock className="h-5 w-5 text-yellow-600" />
                Account Pending Approval
              </>
            )}
            {status?.status === 'rejected' && (
              <>
                <XCircle className="h-5 w-5 text-red-600" />
                Account Approval Rejected
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status?.status === 'pending' && (
            <>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Review in Progress</AlertTitle>
                <AlertDescription>
                  Your seller account is currently being reviewed by our team. This process
                  typically takes 1-2 business days. You will receive an email once your account is
                  approved.
                </AlertDescription>
              </Alert>
              <p className="text-sm text-muted-foreground">
                In the meantime, you can complete your profile and business information to speed up
                the approval process.
              </p>
            </>
          )}

          {status?.status === 'rejected' && (
            <>
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Application Rejected</AlertTitle>
                <AlertDescription>
                  Unfortunately, your seller application has been rejected.
                  {status.rejectionReason && (
                    <span className="mt-2 block font-medium">Reason: {status.rejectionReason}</span>
                  )}
                </AlertDescription>
              </Alert>
              <p className="text-sm text-muted-foreground">
                If you believe this was a mistake or would like to appeal, please contact our
                support team at support@quick-kart.com
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
