import { SellerLayout } from '@/components/seller/navigation/SellerLayout';
import { useSellerDashboard } from '@/hooks/seller';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
} from 'lucide-react';

export default function Analytics() {
  const { data: dashboardData, isLoading } = useSellerDashboard();
  const analytics = dashboardData?.data?.analytics;

  const calculateChange = (current: number, previous: number) => {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const stats = analytics
    ? [
        {
          title: 'Total Revenue',
          value: formatCurrency(analytics.totalRevenue || 0),
          change: calculateChange(
            analytics.totalRevenue || 0,
            analytics.previousPeriodRevenue || 0
          ),
          icon: DollarSign,
          color: 'text-green-600',
        },
        {
          title: 'Total Orders',
          value: (analytics.totalOrders || 0).toString(),
          change: calculateChange(analytics.totalOrders || 0, analytics.previousPeriodOrders || 0),
          icon: ShoppingCart,
          color: 'text-blue-600',
        },
        {
          title: 'Products Sold',
          value: (analytics.totalProductsSold || analytics.totalProducts || 0).toString(),
          change: calculateChange(
            analytics.totalProductsSold || analytics.totalProducts || 0,
            analytics.previousPeriodProductsSold || 0
          ),
          icon: Package,
          color: 'text-purple-600',
        },
        {
          title: 'Avg Order Value',
          value: formatCurrency(analytics.averageOrderValue || 0),
          change: 0,
          icon: TrendingUp,
          color: 'text-orange-600',
        },
      ]
    : [];

  return (
    <SellerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">View insights and performance metrics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-4 rounded-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="mt-2 h-3 w-20" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            stats.map((stat, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  {stat.change !== 0 && (
                    <div className="flex items-center text-xs text-muted-foreground">
                      {stat.change > 0 ? (
                        <>
                          <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
                          <span className="text-green-600">+{stat.change.toFixed(1)}%</span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="mr-1 h-3 w-3 text-red-600" />
                          <span className="text-red-600">{stat.change.toFixed(1)}%</span>
                        </>
                      )}
                      <span className="ml-1">from last period</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Order Status Breakdown */}
        {analytics && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Order Status Breakdown
              </CardTitle>
              <CardDescription>Distribution of orders by status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.ordersByStatus && analytics.ordersByStatus.length > 0 ? (
                  analytics.ordersByStatus.map((item) => (
                    <div key={item.status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-3 w-3 rounded-full ${
                            item.status === 'delivered'
                              ? 'bg-green-500'
                              : item.status === 'cancelled'
                                ? 'bg-red-500'
                                : item.status === 'shipped'
                                  ? 'bg-blue-500'
                                  : 'bg-yellow-500'
                          }`}
                        />
                        <span className="capitalize">{item.status}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          {analytics.totalOrders > 0
                            ? ((item.count / analytics.totalOrders) * 100).toFixed(1)
                            : 0}
                          %
                        </span>
                        <span className="font-semibold">{item.count}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    No order data available
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Additional Info */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Performance Summary</CardTitle>
              <CardDescription>Key performance indicators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                <>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </>
              ) : (
                analytics && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Revenue</span>
                      <span className="font-semibold">
                        {formatCurrency(analytics.totalRevenue)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Average Order Value</span>
                      <span className="font-semibold">
                        {formatCurrency(analytics.averageOrderValue)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Orders</span>
                      <span className="font-semibold">{analytics.totalOrders}</span>
                    </div>
                  </>
                )
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground">
                Analytics data is updated in real-time as orders are processed.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SellerLayout>
  );
}
