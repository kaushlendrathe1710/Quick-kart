import { useState } from 'react';
import { useLocation } from 'wouter';
import { SellerLayout } from '@/components/seller/navigation/SellerLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Package, AlertTriangle, Edit, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProducts, updateProductStock, type Product } from '@/api/seller/products';

interface InventoryItem {
  id: number;
  name: string;
  sku: string;
  category: string;
  currentStock: number;
  reorderLevel: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  lastUpdated: string;
}

export default function Inventory() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [newStockValue, setNewStockValue] = useState('');
  const queryClient = useQueryClient();

  // Fetch products from API
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['seller-products'],
    queryFn: async () => {
      const response = await getProducts({ page: 1, limit: 1000 });
      return response;
    },
  });

  // Stock update mutation
  const updateStockMutation = useMutation({
    mutationFn: ({ productId, stock }: { productId: number; stock: number }) =>
      updateProductStock(productId, stock),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
      toast.success('Stock updated successfully!');
      setEditDialogOpen(false);
      setSelectedItem(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update stock');
    },
  });

  // Convert products to inventory items
  const convertToInventoryItem = (product: Product): InventoryItem => {
    const reorderLevel = 20; // Default reorder level
    let status: 'in_stock' | 'low_stock' | 'out_of_stock';

    if (product.stock === 0) {
      status = 'out_of_stock';
    } else if (product.stock <= reorderLevel) {
      status = 'low_stock';
    } else {
      status = 'in_stock';
    }

    return {
      id: product.id,
      name: product.name,
      sku: product.sku || `SKU-${product.id}`,
      category: product.category,
      currentStock: product.stock,
      reorderLevel,
      status,
      lastUpdated: new Date(product.updatedAt || product.createdAt).toISOString().split('T')[0],
    };
  };

  const inventory = productsData?.data?.map(convertToInventoryItem) || [];

  // Filter inventory
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Calculate statistics
  const totalProducts = inventory.length;
  const lowStockCount = inventory.filter((item) => item.status === 'low_stock').length;
  const outOfStockCount = inventory.filter((item) => item.status === 'out_of_stock').length;
  const totalValue = inventory.reduce((sum, item) => sum + item.currentStock, 0);

  const handleEditStock = (item: InventoryItem) => {
    setSelectedItem(item);
    setNewStockValue(item.currentStock.toString());
    setEditDialogOpen(true);
  };

  const handleUpdateStock = () => {
    if (!selectedItem) return;

    const newStock = parseInt(newStockValue);
    if (isNaN(newStock) || newStock < 0) {
      toast.error('Please enter a valid stock quantity');
      return;
    }

    // Call API to update stock
    updateStockMutation.mutate({
      productId: selectedItem.id,
      stock: newStock,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_stock':
        return (
          <Badge variant="default" className="bg-green-500">
            In Stock
          </Badge>
        );
      case 'low_stock':
        return (
          <Badge variant="default" className="bg-yellow-500">
            Low Stock
          </Badge>
        );
      case 'out_of_stock':
        return <Badge variant="destructive">Out of Stock</Badge>;
      default:
        return null;
    }
  };

  return (
    <SellerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground">Track and manage your product stock levels</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
              <p className="text-xs text-muted-foreground">Active SKUs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalValue}</div>
              <p className="text-xs text-muted-foreground">Units available</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{lowStockCount}</div>
              <p className="text-xs text-muted-foreground">Needs reordering</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{outOfStockCount}</div>
              <p className="text-xs text-muted-foreground">Unavailable items</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Items</CardTitle>
            <CardDescription>View and manage stock levels for all products</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by product name or SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="in_stock">In Stock</SelectItem>
                  <SelectItem value="low_stock">Low Stock</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="Clothing">Clothing</SelectItem>
                  <SelectItem value="Home">Home</SelectItem>
                  <SelectItem value="Sports">Sports</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Inventory Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Current Stock</TableHead>
                    <TableHead className="text-right">Reorder Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    // Loading skeleton
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-4 w-[150px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-[80px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-[100px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="ml-auto h-4 w-[50px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="ml-auto h-4 w-[50px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-[80px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-[80px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="ml-auto h-8 w-[40px]" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredInventory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                        No inventory items found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInventory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.sku}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell className="text-right">{item.currentStock}</TableCell>
                        <TableCell className="text-right">{item.reorderLevel}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell>{item.lastUpdated}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleEditStock(item)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Edit Stock Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Stock Level</DialogTitle>
              <DialogDescription>
                Adjust the stock quantity for {selectedItem?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Current Stock</Label>
                <p className="text-sm text-muted-foreground">{selectedItem?.currentStock} units</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="newStock">New Stock Quantity</Label>
                <Input
                  id="newStock"
                  type="number"
                  min="0"
                  value={newStockValue}
                  onChange={(e) => setNewStockValue(e.target.value)}
                  placeholder="Enter new stock quantity"
                />
              </div>
              <div className="space-y-2">
                <Label>Reorder Level</Label>
                <p className="text-sm text-muted-foreground">
                  {selectedItem?.reorderLevel} units (low stock threshold)
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                disabled={updateStockMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleUpdateStock}
                disabled={updateStockMutation.isPending}
              >
                {updateStockMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Stock'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SellerLayout>
  );
}
