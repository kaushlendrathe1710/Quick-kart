import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, Store as StoreIcon, MapPin, Phone, Mail, Loader2, Building2 } from 'lucide-react';
import {
  useStoreDetails,
  useUpdateStore,
  useUploadStoreLogo,
  useUploadStoreBanner,
} from '@/hooks/seller';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { SellerLayout } from '@/components/seller/navigation/SellerLayout';

const storeFormSchema = z.object({
  storeName: z.string().min(3, 'Store name must be at least 3 characters'),
  storeDescription: z.string().optional(),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
  contactNumber: z.string().regex(/^\d{10}$/, 'Contact number must be 10 digits'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  isActive: z.boolean(),
});

type StoreFormValues = z.infer<typeof storeFormSchema>;

export default function Store() {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const { data: storeData, isLoading: isLoadingStore } = useStoreDetails();
  const updateStore = useUpdateStore();
  const uploadLogo = useUploadStoreLogo();
  const uploadBanner = useUploadStoreBanner();

  const store = storeData?.data;

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
    setValue,
  } = useForm<StoreFormValues>({
    resolver: zodResolver(storeFormSchema),
    values: store
      ? {
          storeName: store.storeName || '',
          storeDescription: store.storeDescription || '',
          address: store.address || '',
          city: store.city || '',
          state: store.state || '',
          pincode: store.pincode || '',
          contactNumber: store.contactNumber || '',
          email: store.email || '',
          isActive: store.isActive ?? true,
        }
      : undefined,
  });

  const isActive = watch('isActive');

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = async () => {
    if (!logoFile) return;
    await uploadLogo.mutateAsync(logoFile);
    setLogoFile(null);
    setLogoPreview(null);
  };

  const handleBannerUpload = async () => {
    if (!bannerFile) return;
    await uploadBanner.mutateAsync(bannerFile);
    setBannerFile(null);
    setBannerPreview(null);
  };

  const onSubmit = async (data: StoreFormValues) => {
    await updateStore.mutateAsync(data);
    reset(data);
  };

  if (isLoadingStore) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SellerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Store Management</h1>
          <p className="text-muted-foreground">
            Manage your store details, branding, and contact information
          </p>
        </div>

        {/* Store Images */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Store Branding
            </CardTitle>
            <CardDescription>
              Upload your store logo and banner to enhance your brand identity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Logo Upload */}
            <div className="space-y-4">
              <Label htmlFor="logo">Store Logo</Label>
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Logo Preview"
                      className="h-32 w-32 rounded-lg border object-cover"
                    />
                  ) : store?.logo ? (
                    <img
                      src={store.logo}
                      alt="Store Logo"
                      className="h-32 w-32 rounded-lg border object-cover"
                    />
                  ) : (
                    <div className="flex h-32 w-32 items-center justify-center rounded-lg border bg-muted">
                      <StoreIcon className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    disabled={uploadLogo.isPending}
                  />
                  {logoFile && (
                    <Button onClick={handleLogoUpload} disabled={uploadLogo.isPending} size="sm">
                      {uploadLogo.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Logo
                        </>
                      )}
                    </Button>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Recommended: Square image, at least 200x200px. Max size: 2MB
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Banner Upload */}
            <div className="space-y-4">
              <Label htmlFor="banner">Store Banner</Label>
              <div className="space-y-3">
                <div className="w-full">
                  {bannerPreview ? (
                    <img
                      src={bannerPreview}
                      alt="Banner Preview"
                      className="h-48 w-full rounded-lg border object-cover"
                    />
                  ) : store?.banner ? (
                    <img
                      src={store.banner}
                      alt="Store Banner"
                      className="h-48 w-full rounded-lg border object-cover"
                    />
                  ) : (
                    <div className="flex h-48 w-full items-center justify-center rounded-lg border bg-muted">
                      <Upload className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <Input
                    id="banner"
                    type="file"
                    accept="image/*"
                    onChange={handleBannerChange}
                    disabled={uploadBanner.isPending}
                  />
                  {bannerFile && (
                    <Button
                      onClick={handleBannerUpload}
                      disabled={uploadBanner.isPending}
                      size="sm"
                    >
                      {uploadBanner.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Banner
                        </>
                      )}
                    </Button>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Recommended: 1200x400px or wider. Max size: 5MB
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Store Details Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StoreIcon className="h-5 w-5" />
                Store Information
              </CardTitle>
              <CardDescription>
                Update your store's basic information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Store Status */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isActive">Store Status</Label>
                  <p className="text-sm text-muted-foreground">
                    {isActive
                      ? 'Your store is currently active and visible to customers'
                      : 'Your store is currently inactive and hidden from customers'}
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={(checked: boolean) =>
                    setValue('isActive', checked, { shouldDirty: true })
                  }
                />
              </div>

              <Separator />

              {/* Basic Information */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="storeName">
                    Store Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="storeName"
                    placeholder="Enter store name"
                    {...register('storeName')}
                    className={errors.storeName ? 'border-destructive' : ''}
                  />
                  {errors.storeName && (
                    <p className="text-sm text-destructive">{errors.storeName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="store@example.com"
                      className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
                      {...register('email')}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="storeDescription">Store Description</Label>
                <Textarea
                  id="storeDescription"
                  placeholder="Describe your store and what makes it unique"
                  rows={4}
                  {...register('storeDescription')}
                />
              </div>

              <Separator />

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Contact Information</h3>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contactNumber">
                      Contact Number <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="contactNumber"
                        type="tel"
                        placeholder="1234567890"
                        className={`pl-10 ${errors.contactNumber ? 'border-destructive' : ''}`}
                        {...register('contactNumber')}
                      />
                    </div>
                    {errors.contactNumber && (
                      <p className="text-sm text-destructive">{errors.contactNumber.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Address Information */}
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <MapPin className="h-5 w-5" />
                  Address Information
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="address">
                    Street Address <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="address"
                    placeholder="Enter full address"
                    rows={3}
                    className={errors.address ? 'border-destructive' : ''}
                    {...register('address')}
                  />
                  {errors.address && (
                    <p className="text-sm text-destructive">{errors.address.message}</p>
                  )}
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="city">
                      City <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="city"
                      placeholder="City"
                      className={errors.city ? 'border-destructive' : ''}
                      {...register('city')}
                    />
                    {errors.city && (
                      <p className="text-sm text-destructive">{errors.city.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">
                      State <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="state"
                      placeholder="State"
                      className={errors.state ? 'border-destructive' : ''}
                      {...register('state')}
                    />
                    {errors.state && (
                      <p className="text-sm text-destructive">{errors.state.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pincode">
                      Pincode <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="pincode"
                      placeholder="123456"
                      className={errors.pincode ? 'border-destructive' : ''}
                      {...register('pincode')}
                    />
                    {errors.pincode && (
                      <p className="text-sm text-destructive">{errors.pincode.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-4 pt-4">
                <Button type="submit" disabled={!isDirty || updateStore.isPending}>
                  {updateStore.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
                {isDirty && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => reset()}
                    disabled={updateStore.isPending}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </SellerLayout>
  );
}
