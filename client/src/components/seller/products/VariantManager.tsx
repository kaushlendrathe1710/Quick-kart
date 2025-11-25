import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { toast } from 'sonner';

export interface ProductVariant {
  id?: number;
  sku?: string;
  color?: string;
  size?: string;
  price: number;
  mrp?: number;
  stock: number;
  images?: string; // JSON string
}

interface VariantManagerProps {
  variants: ProductVariant[];
  onChange: (variants: ProductVariant[]) => void;
  disabled?: boolean;
}

export function VariantManager({ variants, onChange, disabled = false }: VariantManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<ProductVariant>({
    sku: '',
    color: '',
    size: '',
    price: 0,
    mrp: 0,
    stock: 0,
    images: '',
  });

  const handleAdd = () => {
    setEditingIndex(null);
    setFormData({
      sku: '',
      color: '',
      size: '',
      price: 0,
      mrp: 0,
      stock: 0,
      images: '',
    });
    setDialogOpen(true);
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setFormData(variants[index]);
    setDialogOpen(true);
  };

  const handleDelete = (index: number) => {
    if (confirm('Are you sure you want to delete this variant?')) {
      const newVariants = variants.filter((_, i) => i !== index);
      onChange(newVariants);
      toast.success('Variant deleted');
    }
  };

  const handleSave = () => {
    // Validate
    if (!formData.price || formData.price <= 0) {
      toast.error('Price is required and must be positive');
      return;
    }
    if (formData.stock < 0) {
      toast.error('Stock cannot be negative');
      return;
    }

    let newVariants: ProductVariant[];
    if (editingIndex !== null) {
      // Update existing
      newVariants = variants.map((v, i) => (i === editingIndex ? formData : v));
      toast.success('Variant updated');
    } else {
      // Add new
      newVariants = [...variants, formData];
      toast.success('Variant added');
    }

    onChange(newVariants);
    setDialogOpen(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Product Variants
            </CardTitle>
            <CardDescription>
              Manage different variations of this product (color, size, etc.)
            </CardDescription>
          </div>
          <Button type='button' onClick={handleAdd} disabled={disabled} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Variant
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {variants.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <Package className="mx-auto mb-2 h-12 w-12 opacity-50" />
            <p>No variants added yet</p>
            <p className="text-sm">Click "Add Variant" to create product variations</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">MRP</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variants.map((variant, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{variant.sku || '-'}</TableCell>
                    <TableCell>{variant.color || '-'}</TableCell>
                    <TableCell>{variant.size || '-'}</TableCell>
                    <TableCell className="text-right">{formatCurrency(variant.price)}</TableCell>
                    <TableCell className="text-right">
                      {variant.mrp ? formatCurrency(variant.mrp) : '-'}
                    </TableCell>
                    <TableCell className="text-right">{variant.stock}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(index)}
                          disabled={disabled}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(index)}
                          disabled={disabled}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Variant Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingIndex !== null ? 'Edit Variant' : 'Add Variant'}</DialogTitle>
              <DialogDescription>Configure the details for this product variant</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU (Optional)</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="e.g., PROD-RED-L"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="e.g., Red"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="size">Size</Label>
                  <Input
                    id="size"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    placeholder="e.g., L, XL"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">
                    Price (₹) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mrp">MRP (₹)</Label>
                  <Input
                    id="mrp"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.mrp || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, mrp: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">
                  Stock <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleSave}>
                {editingIndex !== null ? 'Update' : 'Add'} Variant
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
