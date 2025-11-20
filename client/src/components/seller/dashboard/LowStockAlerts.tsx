import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { AlertTriangle, Package } from 'lucide-react';
import type { LowStockProduct } from '@/api/seller/dashboard';

/**
 * Low Stock Alerts Component
 * Displays products with low inventory levels
 */

interface LowStockAlertsProps {
  products: LowStockProduct[];
  isLoading?: boolean;
}

export function LowStockAlerts({ products, isLoading }: LowStockAlertsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Low Stock Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!products || products.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Low Stock Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Package className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">All products have sufficient stock</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          Low Stock Alerts
        </CardTitle>
        <Link href="/seller/inventory">
          <a>
            <Button variant="ghost" size="sm">
              Manage Inventory
            </Button>
          </a>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {products.map((product) => (
            <Link key={product.id} href={`/seller/products/edit/${product.id}`}>
              <a className="block rounded-lg border p-3 transition-colors hover:bg-accent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {product.thumbnail && (
                      <img
                        src={product.thumbnail}
                        alt={product.name}
                        className="h-10 w-10 rounded object-cover"
                      />
                    )}
                    <div>
                      <p className="font-medium">{product.name}</p>
                      {product.sku && (
                        <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={product.stock === 0 ? 'destructive' : 'secondary'}
                      className={product.stock === 0 ? '' : 'bg-yellow-100 text-yellow-800'}
                    >
                      {product.stock === 0 ? 'Out of Stock' : `${product.stock} left`}
                    </Badge>
                  </div>
                </div>
              </a>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
