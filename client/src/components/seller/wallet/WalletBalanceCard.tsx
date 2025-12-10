import { Wallet, TrendingUp, ArrowDownCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Wallet as WalletType } from '@shared/types';

interface WalletBalanceCardProps {
  wallet: WalletType;
}

export function WalletBalanceCard({ wallet }: WalletBalanceCardProps) {
  if (!wallet) {
    return null;
  }

  const stats = [
    {
      title: 'Total Balance',
      value: `₹${parseFloat(wallet.balance).toFixed(2)}`,
      description: 'Current wallet balance',
      icon: Wallet,
      color: 'text-blue-600',
    },
    {
      title: 'Withdrawable',
      value: `₹${parseFloat(wallet.withdrawableBalance).toFixed(2)}`,
      description: 'Available for withdrawal',
      icon: ArrowDownCircle,
      color: 'text-green-600',
    },
    {
      title: 'Total Earnings',
      value: `₹${parseFloat(wallet.totalEarnings).toFixed(2)}`,
      description: 'Lifetime earnings',
      icon: TrendingUp,
      color: 'text-purple-600',
    },
    {
      title: 'Pending',
      value: `₹${parseFloat(wallet.pendingAmount).toFixed(2)}`,
      description: 'Pending clearance',
      icon: Clock,
      color: 'text-orange-600',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
