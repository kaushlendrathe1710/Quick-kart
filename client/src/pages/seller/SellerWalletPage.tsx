import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { WalletBalanceCard } from '@/components/seller/wallet/WalletBalanceCard';
import { TransactionsTable } from '@/components/seller/wallet/TransactionsTable';
import { WithdrawalRequestForm } from '@/components/seller/wallet/WithdrawalRequestForm';
import { WithdrawalRequestsList } from '@/components/seller/wallet/WithdrawalRequestsList';
import { useSellerWallet } from '@/hooks/seller';
import { SellerLayout } from '@/components/seller/navigation/SellerLayout';

export function SellerWalletPage() {
  const { wallet, isLoadingWallet, walletError } = useSellerWallet();

  if (isLoadingWallet) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (walletError) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load wallet information. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Wallet Found</AlertTitle>
          <AlertDescription>
            Your wallet will be created automatically once you receive your first payment.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <SellerLayout>
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wallet</h1>
          <p className="text-muted-foreground">Manage your earnings and withdrawal requests</p>
        </div>
        <WithdrawalRequestForm wallet={wallet} />
      </div>

      <WalletBalanceCard wallet={wallet} />

      <TransactionsTable />

      <WithdrawalRequestsList />
    </div>
    </SellerLayout>
  );
}

export default SellerWalletPage;
