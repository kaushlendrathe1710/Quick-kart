import { useState } from 'react';
import { useLocation } from 'wouter';
import { SellerLayout } from '@/components/seller/navigation/SellerLayout';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Loader2, Save, PackagePlus } from 'lucide-react';
import { toast } from 'sonner';
import { CategorySelect } from '@/components/seller/products/CategorySelect';
import { ImageUpload, MultiImageUpload } from '@/components/seller/products/ImageUpload';
import { VariantManager, type ProductVariant } from '@/components/seller/products/VariantManager';
import { SpecificationInput } from '@/components/seller/products/SpecificationInput';
import {
  createProduct,
  uploadProductImages,
  type CreateProductRequest,
} from '@/api/seller/products';

const productSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  specifications: z.string().optional(),
  price: z.number().positive('Price must be a positive number'),
  mrp: z.number().positive('MRP must be a positive number').optional(),
  stock: z.number().min(0, 'Stock must be a non-negative number'),
  sku: z.string().optional(),
  weight: z.string().optional(),
  length: z.string().optional(),
  width: z.string().optional(),
  height: z.string().optional(),
  warranty: z.number().int().optional(),
  returnPolicy: z.string().optional(),
  deliveryCharges: z.number().min(0).optional(),
  gstRate: z.string().optional(),
  isDraft: z.boolean().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function AddProduct() {
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [categoryName, setCategoryName] = useState<string>('');
  const [subcategoryId, setSubcategoryId] = useState<number | null>(null);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      specifications: '',
      price: 0,
      mrp: 0,
      stock: 0,
      sku: '',
      weight: '',
      length: '',
      width: '',
      height: '',
      warranty: 0,
      returnPolicy: '',
      deliveryCharges: 0,
      gstRate: '',
      isDraft: false,
    },
  });

  const isDraft = watch('isDraft');

  const onSubmit = async (data: ProductFormData) => {
    // Validate category
    if (!categoryId || !categoryName) {
      toast.error('Please select a category');
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare product data
      const productData: CreateProductRequest = {
        name: data.name,
        description: data.description,
        specifications: data.specifications || '',
        price: Math.round(data.price),
        mrp: data.mrp ? Math.round(data.mrp) : undefined,
        stock: Math.round(data.stock),
        category: categoryName,
        categoryId: categoryId,
        subcategoryId: subcategoryId,
        sku: data.sku || '',
        weight: data.weight || '',
        length: data.length || '',
        width: data.width || '',
        height: data.height || '',
        warranty: data.warranty || 0,
        returnPolicy: data.returnPolicy || '',
        deliveryCharges: data.deliveryCharges ? Math.round(data.deliveryCharges) : 0,
        gstRate: data.gstRate || '',
        isDraft: data.isDraft,
        thumbnail: thumbnail || '',
        imageUrls: JSON.stringify(productImages),
        variants: variants.length > 0 ? JSON.stringify(variants) : '',
      };

      // Create product
      const response = await createProduct(productData);
      const newProductId = response.data.id;

      // Upload images if any
      if (thumbnailFile || imageFiles.length > 0) {
        try {
          const allFiles = [...(thumbnailFile ? [thumbnailFile] : []), ...imageFiles];
          await uploadProductImages(newProductId, allFiles);
        } catch (uploadError) {
          console.error('Error uploading images:', uploadError);
          toast.warning('Product created but some images failed to upload');
        }
      }

      toast.success(
        data.isDraft
          ? 'Product saved as draft'
          : 'Product created successfully and pending approval'
      );
      setLocation('/seller/products');
    } catch (error: any) {
      console.error('Error creating product:', error);
      toast.error(error.response?.data?.message || 'Failed to create product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCategoryChange = (catId: number, catName: string) => {
    setCategoryId(catId);
    setCategoryName(catName);
  };

  const handleSubcategoryChange = (subId: number | null) => {
    setSubcategoryId(subId);
  };

  return (
    <SellerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Add New Product</h1>
            <p className="text-muted-foreground">Create a new product for your store</p>
          </div>
          <Button variant="outline" onClick={() => setLocation('/seller/products')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Enter the basic details of your product</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Product Name <span className="text-red-500">*</span>
                </Label>
                <Input id="name" placeholder="e.g., Premium Cotton T-Shirt" {...register('name')} />
                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Detailed product description..."
                  rows={5}
                  {...register('description')}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="specifications">Specifications (Optional)</Label>
                <SpecificationInput
                  value={watch('specifications')}
                  onChange={(value) => setValue('specifications', value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">SKU (Optional)</Label>
                <Input id="sku" placeholder="Product SKU" {...register('sku')} />
              </div>
            </CardContent>
          </Card>

          {/* Category Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Category & Classification</CardTitle>
              <CardDescription>Choose the appropriate category for your product</CardDescription>
            </CardHeader>
            <CardContent>
              <CategorySelect
                categoryId={categoryId}
                subcategoryId={subcategoryId}
                onCategoryChange={handleCategoryChange}
                onSubcategoryChange={handleSubcategoryChange}
                required
              />
            </CardContent>
          </Card>

          {/* Product Images */}
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
              <CardDescription>
                Upload product thumbnail and additional images (max 10 images)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ImageUpload
                label="Product Thumbnail"
                value={thumbnail}
                onChange={setThumbnail}
                onFileSelect={setThumbnailFile}
                aspectRatio="1/1"
                required
              />
              <MultiImageUpload
                label="Additional Images"
                values={productImages}
                onChange={setProductImages}
                onFilesSelect={(files) => setImageFiles([...imageFiles, ...files])}
                maxImages={10}
              />
            </CardContent>
          </Card>

          {/* Pricing & Inventory */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Inventory</CardTitle>
              <CardDescription>Set pricing and stock information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="price">
                    Selling Price (₹) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="1"
                    placeholder="0"
                    {...register('price', { valueAsNumber: true })}
                  />
                  {errors.price && <p className="text-sm text-red-500">{errors.price.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mrp">MRP (₹)</Label>
                  <Input
                    id="mrp"
                    type="number"
                    step="1"
                    placeholder="0"
                    {...register('mrp', { valueAsNumber: true })}
                  />
                  {errors.mrp && <p className="text-sm text-red-500">{errors.mrp.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock">
                    Stock Quantity <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="stock"
                    type="number"
                    placeholder="0"
                    {...register('stock', { valueAsNumber: true })}
                  />
                  {errors.stock && <p className="text-sm text-red-500">{errors.stock.message}</p>}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="gstRate">GST Rate (%)</Label>
                  <Input id="gstRate" placeholder="e.g., 18" {...register('gstRate')} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliveryCharges">Delivery Charges (₹)</Label>
                  <Input
                    id="deliveryCharges"
                    type="number"
                    placeholder="0"
                    {...register('deliveryCharges', { valueAsNumber: true })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Variants */}
          <VariantManager variants={variants} onChange={setVariants} />

          {/* Product Details */}
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
              <CardDescription>Additional product specifications and policies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register('weight')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="length">Length (cm)</Label>
                  <Input
                    id="length"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register('length')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="width">Width (cm)</Label>
                  <Input
                    id="width"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register('width')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register('height')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="warranty">Warranty (months)</Label>
                <Input
                  id="warranty"
                  type="number"
                  placeholder="0"
                  {...register('warranty', { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="returnPolicy">Return Policy</Label>
                <Textarea
                  id="returnPolicy"
                  placeholder="Describe your return policy..."
                  rows={3}
                  {...register('returnPolicy')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isDraft"
                    checked={isDraft}
                    onCheckedChange={(checked: boolean) => setValue('isDraft', checked as boolean)}
                  />
                  <Label
                    htmlFor="isDraft"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Save as draft (don't submit for approval yet)
                  </Label>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation('/seller/products')}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isDraft ? 'Saving Draft...' : 'Creating Product...'}
                      </>
                    ) : (
                      <>
                        <PackagePlus className="mr-2 h-4 w-4" />
                        {isDraft ? 'Save as Draft' : 'Create Product'}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </SellerLayout>
  );
}
