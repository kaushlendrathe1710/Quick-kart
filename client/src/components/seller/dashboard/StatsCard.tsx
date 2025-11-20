import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Stats Card Component
 * Displays a single statistic with icon and trend
 */

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: number;
  trendLabel?: string;
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  className,
}: StatsCardProps) {
  const isPositive = trend !== undefined && trend >= 0;

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend !== undefined && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {isPositive ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            <span className={cn(isPositive ? 'text-green-600' : 'text-red-600')}>
              {isPositive ? '+' : ''}
              {trend.toFixed(1)}%
            </span>
            {trendLabel && <span className="ml-1">{trendLabel}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
