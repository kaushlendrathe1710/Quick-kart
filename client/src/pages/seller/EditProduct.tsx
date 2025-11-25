import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { SellerLayout } from '@/components/seller/navigation/SellerLayout';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Save, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { CategorySelect } from '@/components/seller/products/CategorySelect';
import { ImageUpload, MultiImageUpload } from '@/components/seller/products/ImageUpload';
import {
  VariantManager,
  type ProductVariant as VariantFormData,
} from '@/components/seller/products/VariantManager';
import { SpecificationInput } from '@/components/seller/products/SpecificationInput';
import {
  getProduct,
  updateProduct,
  getProductVariants,
  createOrUpdateVariants,
  uploadProductImages,
  type UpdateProductRequest,
  type ProductVariant as ApiProductVariant,
} from '@/api/seller/products';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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

export default function EditProduct() {
  const params = useParams();
  const productId = parseInt(params.id || '0');
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [categoryName, setCategoryName] = useState<string>('');
  const [subcategoryId, setSubcategoryId] = useState<number | null>(null);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [variants, setVariants] = useState<VariantFormData[]>([]);
  const [originalVariants, setOriginalVariants] = useState<VariantFormData[]>([]);
  const [productStatus, setProductStatus] = useState<{
    approved: boolean;
    rejected: boolean;
    isDraft: boolean;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  const isDraft = watch('isDraft');

  useEffect(() => {
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const loadProduct = async () => {
    try {
      setIsLoading(true);

      // Load product details
      const productResponse = await getProduct(productId);
      const product = productResponse.data;

      // Set status
      setProductStatus({
        approved: product.approved,
        rejected: product.rejected,
        isDraft: product.isDraft,
      });

      // Parse and set images
      let images: string[] = [];
      if (product.imageUrls) {
        try {
          images = JSON.parse(product.imageUrls);
        } catch {
          images = [product.imageUrls];
        }
      }

      // Set form values
      reset({
        name: product.name,
        description: product.description || '',
        specifications: product.specifications || '',
        price: product.price,
        mrp: product.mrp || 0,
        stock: product.stock,
        sku: product.sku || '',
        weight: product.weight || '',
        length: product.length || '',
        width: product.width || '',
        height: product.height || '',
        warranty: product.warranty || 0,
        returnPolicy: product.returnPolicy || '',
        deliveryCharges: product.deliveryCharges || 0,
        gstRate: product.gstRate || '',
        isDraft: product.isDraft,
      });

      // Set category
      if (product.categoryId) {
        setCategoryId(product.categoryId);
        setCategoryName(product.category);
      }
      if (product.subcategoryId) {
        setSubcategoryId(product.subcategoryId);
      }

      // Set images
      setThumbnail(product.thumbnail || null);
      setProductImages(images);

      // Load variants
      try {
        const variantsResponse = await getProductVariants(productId);
        const apiVariants = variantsResponse.data;
        // Convert API variants to form variants
        const formVariants: VariantFormData[] = apiVariants.map((v) => ({
          id: v.id,
          sku: v.sku || '',
          color: v.color || '',
          size: v.size || '',
          price: v.price || 0,
          mrp: v.mrp || 0,
          stock: v.stock,
          images: v.images || '',
        }));
        setVariants(formVariants);
        setOriginalVariants(formVariants);
      } catch (error) {
        console.error('Error loading variants:', error);
        setVariants([]);
      }
    } catch (error) {
      console.error('Error loading product:', error);
      toast.error('Failed to load product');
      setLocation('/seller/products');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    // Validate category
    if (!categoryId || !categoryName) {
      toast.error('Please select a category');
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare product data
      const productData: UpdateProductRequest = {
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
      };

      // Update product
      await updateProduct(productId, productData);

      // Upload new images if any
      if (thumbnailFile || imageFiles.length > 0) {
        try {
          const allFiles = [...(thumbnailFile ? [thumbnailFile] : []), ...imageFiles];
          await uploadProductImages(productId, allFiles);
        } catch (uploadError) {
          console.error('Error uploading images:', uploadError);
          toast.warning('Product updated but some images failed to upload');
        }
      }

      // Update variants if changed
      if (JSON.stringify(variants) !== JSON.stringify(originalVariants)) {
        try {
          await createOrUpdateVariants(productId, variants);
        } catch (variantError) {
          console.error('Error updating variants:', variantError);
          toast.warning('Product updated but variant update failed');
        }
      }

      toast.success('Product updated successfully');
      setLocation('/seller/products');
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast.error(error.response?.data?.message || 'Failed to update product');
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

  if (isLoading) {
    return (
      <SellerLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
            <p className="text-muted-foreground">Update product details</p>
          </div>
          <Button variant="outline" onClick={() => setLocation('/seller/products')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
        </div>

        {/* Status Alert */}
        {productStatus && (
          <>
            {productStatus.rejected && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Product Rejected</AlertTitle>
                <AlertDescription>
                  This product was rejected. Updates will require admin approval again.
                </AlertDescription>
              </Alert>
            )}
            {productStatus.isDraft && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Draft Product</AlertTitle>
                <AlertDescription>
                  This product is saved as a draft. Uncheck "Save as draft" to submit for approval.
                </AlertDescription>
              </Alert>
            )}
            {!productStatus.approved && !productStatus.isDraft && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Pending Approval</AlertTitle>
                <AlertDescription>
                  This product is pending admin approval before it goes live.
                </AlertDescription>
              </Alert>
            )}
          </>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Update the basic details of your product</CardDescription>
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
              <CardDescription>Update the category for your product</CardDescription>
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
                Update product thumbnail and additional images (max 10 images)
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
              <CardDescription>Update pricing and stock information</CardDescription>
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
              <CardDescription>Update product specifications and policies</CardDescription>
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
                    Save as draft (don't submit for approval)
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
                        Updating Product...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Update Product
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
