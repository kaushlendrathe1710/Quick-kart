import { SellerLayout } from '@/components/seller/navigation/SellerLayout';
import { ApprovalCheck } from '@/components/seller/navigation/ApprovalCheck';
import { StatsCard } from '@/components/seller/dashboard/StatsCard';
import { RecentOrders } from '@/components/seller/dashboard/RecentOrders';
import { LowStockAlerts } from '@/components/seller/dashboard/LowStockAlerts';
import { useSellerDashboard, useLowStockProducts } from '@/hooks/seller';
import { DollarSign, ShoppingCart, Package, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

/**
 * Seller Dashboard Page
 * Main dashboard showing overview, stats, recent orders, and alerts
 */

export default function SellerDashboardPage() {
  const { data: dashboardData, isLoading, error } = useSellerDashboard();
  const { data: lowStockData, isLoading: loadingLowStock } = useLowStockProducts(10);

  const analytics = dashboardData?.data?.analytics;
  const recentOrders = dashboardData?.data?.recentOrders || [];
  const pendingProductsCount = dashboardData?.data?.pendingProductsCount || 0;
  const lowStockProducts = lowStockData?.data || [];

  return (
    <SellerLayout>
      <ApprovalCheck showAlways>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Overview of your seller account and performance</p>
          </div>

          {/* Error State */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Failed to load dashboard data. Please try again later.
              </AlertDescription>
            </Alert>
          )}

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {isLoading ? (
              <>
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </>
            ) : (
              <>
                <StatsCard
                  title="Total Revenue"
                  value={`₹${analytics?.totalRevenue?.toLocaleString() || 0}`}
                  icon={DollarSign}
                  trend={analytics?.revenueGrowth}
                  trendLabel="from last month"
                />
                <StatsCard
                  title="Total Orders"
                  value={analytics?.totalOrders?.toLocaleString() || 0}
                  icon={ShoppingCart}
                  trend={analytics?.ordersGrowth}
                  trendLabel="from last month"
                />
                <StatsCard
                  title="Total Products"
                  value={analytics?.totalProducts?.toLocaleString() || 0}
                  icon={Package}
                />
                <StatsCard
                  title="Pending Orders"
                  value={analytics?.pendingOrders?.toLocaleString() || 0}
                  icon={Clock}
                />
              </>
            )}
          </div>

          {/* Pending Products Alert */}
          {pendingProductsCount > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Pending Product Approvals</AlertTitle>
              <AlertDescription>
                You have {pendingProductsCount} product(s) pending admin approval.
              </AlertDescription>
            </Alert>
          )}

          {/* Content Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Orders */}
            <RecentOrders orders={recentOrders} isLoading={isLoading} />

            {/* Low Stock Alerts */}
            <LowStockAlerts products={lowStockProducts} isLoading={loadingLowStock} />
          </div>
        </div>
      </ApprovalCheck>
    </SellerLayout>
  );
}
