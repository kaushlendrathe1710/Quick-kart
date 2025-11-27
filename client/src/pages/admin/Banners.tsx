import { useState, useMemo, useRef } from 'react';
import { AdminLayout } from '@/components/admin/navigation/AdminLayout';
import {
  useAllBanners,
  useCreateBanner,
  useUpdateBanner,
  useDeleteBanner,
  useToggleBannerActive,
  useUpdateBannerPosition,
} from '@/hooks/admin';
import { uploadBannerImage } from '@/api/admin/banners';
import { PaginatedCategorySelector } from '@/components/common/PaginatedCategorySelector';
import { PaginatedSubcategorySelector } from '@/components/common/PaginatedSubcategorySelector';
import { PaginatedProductSelector } from '@/components/common/PaginatedProductSelector';
import {
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
  Upload,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import type { Banner, CreateBannerRequest } from '@/api/admin/banners';

/**
 * Admin Banners Management Page
 * Manage homepage banners with CRUD operations
 */

export default function AdminBannersPage() {
  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Dialog states
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<CreateBannerRequest>>({
    title: '',
    subtitle: '',
    imageUrl: '',
    buttonText: '',
    category: '',
    subcategory: '',
    badgeText: '',
    productId: undefined,
    active: true,
    position: 0,
  });

  // Fetch banners
  const { data: bannersData, isLoading } = useAllBanners(page, limit);
  const banners = bannersData?.data || [];
  const totalPages = bannersData?.pagination?.totalPages || 1;

  // Mutations
  const createMutation = useCreateBanner();
  const updateMutation = useUpdateBanner();
  const deleteMutation = useDeleteBanner();
  const toggleActiveMutation = useToggleBannerActive();
  const updatePositionMutation = useUpdateBannerPosition();

  // Filter banners by search query (client-side)
  const filteredBanners = useMemo(() => {
    if (!searchQuery.trim()) return banners;
    const query = searchQuery.toLowerCase();
    return banners.filter(
      (banner) =>
        banner.title?.toLowerCase().includes(query) ||
        banner.subtitle?.toLowerCase().includes(query) ||
        banner.category?.toLowerCase().includes(query) ||
        banner.subcategory?.toLowerCase().includes(query)
    );
  }, [banners, searchQuery]);

  // Handlers
  const handleViewBanner = (banner: Banner) => {
    setSelectedBanner(banner);
    setViewDialogOpen(true);
  };

  const handleOpenEditDialog = (banner: Banner) => {
    setSelectedBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || '',
      imageUrl: banner.imageUrl,
      buttonText: banner.buttonText || '',
      category: banner.category || '',
      subcategory: banner.subcategory || '',
      badgeText: banner.badgeText || '',
      productId: banner.productId || undefined,
      active: banner.active,
      position: banner.position,
    });
    setImagePreview(banner.imageUrl);
    setSelectedFile(null);
    setEditDialogOpen(true);
  };

  const handleOpenCreateDialog = () => {
    setFormData({
      title: '',
      subtitle: '',
      imageUrl: '',
      buttonText: '',
      category: '',
      subcategory: '',
      badgeText: '',
      productId: undefined,
      active: true,
      position: 0,
    });
    setImagePreview('');
    setSelectedFile(null);
    setCreateDialogOpen(true);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Invalid file type. Please select a JPG, PNG, or WEBP image');
        return;
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File too large. Please select an image smaller than 10MB');
        return;
      }

      setSelectedFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview('');
    setFormData({ ...formData, imageUrl: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadImage = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const response = await uploadBannerImage(selectedFile);
      setFormData({ ...formData, imageUrl: response.imageUrl });
      toast.success('Banner image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload banner image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenDeleteDialog = (banner: Banner) => {
    setSelectedBanner(banner);
    setDeleteDialogOpen(true);
  };

  const handleCreateBanner = () => {
    if (!formData.title || !formData.imageUrl) return;

    createMutation.mutate(formData as CreateBannerRequest, {
      onSuccess: () => {
        setCreateDialogOpen(false);
        setFormData({
          title: '',
          subtitle: '',
          imageUrl: '',
          buttonText: '',
          category: '',
          subcategory: '',
          badgeText: '',
          productId: undefined,
          active: true,
          position: 0,
        });
      },
    });
  };

  const handleUpdateBanner = () => {
    if (!selectedBanner || !formData.title || !formData.imageUrl) return;

    updateMutation.mutate(
      {
        id: selectedBanner.id,
        data: formData as CreateBannerRequest,
      },
      {
        onSuccess: () => {
          setEditDialogOpen(false);
          setSelectedBanner(null);
        },
      }
    );
  };

  const handleDeleteBanner = () => {
    if (!selectedBanner) return;

    deleteMutation.mutate(selectedBanner.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setSelectedBanner(null);
      },
    });
  };

  const handleToggleActive = (banner: Banner) => {
    toggleActiveMutation.mutate(banner.id);
  };

  const handleMovePosition = (banner: Banner, direction: 'up' | 'down') => {
    const newPosition = direction === 'up' ? banner.position - 1 : banner.position + 1;
    if (newPosition < 0) return;
    updatePositionMutation.mutate({ id: banner.id, position: newPosition });
  };

  // Render status badge
  const renderStatusBadge = (active: boolean) => {
    if (active) {
      return (
        <Badge variant="default" className="bg-green-500">
          Active
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-gray-500">
        Inactive
      </Badge>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Banners</h1>
            <p className="text-muted-foreground">Manage homepage banners and promotions</p>
          </div>
          <Button onClick={handleOpenCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Create Banner
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Banners</CardTitle>
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bannersData?.pagination?.total || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Banners</CardTitle>
              <ImageIcon className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{banners.filter((b) => b.active).length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive Banners</CardTitle>
              <ImageIcon className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{banners.filter((b) => !b.active).length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search banners by title, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Banners Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Banners</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredBanners.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ImageIcon className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">No banners found</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  {searchQuery
                    ? 'Try adjusting your search query'
                    : 'Get started by creating your first banner'}
                </p>
                {!searchQuery && (
                  <Button onClick={handleOpenCreateDialog}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Banner
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBanners.map((banner) => (
                    <TableRow key={banner.id}>
                      <TableCell>
                        <div className="h-12 w-20 overflow-hidden rounded border">
                          <img
                            src={banner.imageUrl}
                            alt={banner.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{banner.title}</span>
                          {banner.subtitle && (
                            <span className="text-sm text-muted-foreground">{banner.subtitle}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          {banner.category && <span className="text-sm">{banner.category}</span>}
                          {banner.subcategory && (
                            <span className="text-xs text-muted-foreground">
                              {banner.subcategory}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMovePosition(banner, 'up')}
                            disabled={banner.position === 0}
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <span className="text-sm">{banner.position}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMovePosition(banner, 'down')}
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {renderStatusBadge(banner.active)}
                          <Switch
                            checked={banner.active}
                            onCheckedChange={() => handleToggleActive(banner)}
                          />
                        </div>
                      </TableCell>
                      <TableCell>{new Date(banner.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewBanner(banner)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenEditDialog(banner)}>
                              <Edit2 className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleOpenDeleteDialog(banner)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* View Banner Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Banner Details</DialogTitle>
          </DialogHeader>
          {selectedBanner && (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-lg border">
                <img
                  src={selectedBanner.imageUrl}
                  alt={selectedBanner.title}
                  className="w-full object-cover"
                />
              </div>
              <div className="grid gap-4">
                <div>
                  <Label className="text-muted-foreground">Title</Label>
                  <p className="font-medium">{selectedBanner.title}</p>
                </div>
                {selectedBanner.subtitle && (
                  <div>
                    <Label className="text-muted-foreground">Subtitle</Label>
                    <p>{selectedBanner.subtitle}</p>
                  </div>
                )}
                {selectedBanner.buttonText && (
                  <div>
                    <Label className="text-muted-foreground">Button Text</Label>
                    <p>{selectedBanner.buttonText}</p>
                  </div>
                )}
                {selectedBanner.category && (
                  <div>
                    <Label className="text-muted-foreground">Category</Label>
                    <p>{selectedBanner.category}</p>
                  </div>
                )}
                {selectedBanner.subcategory && (
                  <div>
                    <Label className="text-muted-foreground">Subcategory</Label>
                    <p>{selectedBanner.subcategory}</p>
                  </div>
                )}
                {selectedBanner.badgeText && (
                  <div>
                    <Label className="text-muted-foreground">Badge Text</Label>
                    <Badge>{selectedBanner.badgeText}</Badge>
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <div>
                    <Label className="text-muted-foreground">Status</Label>
                    <div className="mt-1">{renderStatusBadge(selectedBanner.active)}</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Position</Label>
                    <p className="mt-1">{selectedBanner.position}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Banner Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Banner</DialogTitle>
            <DialogDescription>
              Add a new banner to the homepage. Fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Summer Sale 2024"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input
                id="subtitle"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="e.g., Up to 50% off on selected items"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="imageUrl">
                Banner Image <span className="text-red-500">*</span>
              </Label>

              {/* File Upload Section */}
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {!imagePreview ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8 text-center hover:border-primary"
                  >
                    <Upload className="mb-2 h-8 w-8 text-gray-400" />
                    <p className="text-sm font-medium">Click to upload banner image</p>
                    <p className="text-xs text-muted-foreground">JPG, PNG, or WEBP (Max 10MB)</p>
                  </div>
                ) : (
                  <div className="relative overflow-hidden rounded-lg border">
                    <img src={imagePreview} alt="Preview" className="w-full object-cover" />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {selectedFile && !formData.imageUrl && (
                  <Button
                    type="button"
                    onClick={handleUploadImage}
                    disabled={isUploading}
                    className="w-full"
                  >
                    {isUploading ? 'Uploading...' : 'Upload Image'}
                  </Button>
                )}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="buttonText">Button Text</Label>
              <Input
                id="buttonText"
                value={formData.buttonText}
                onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                placeholder="e.g., Shop Now"
              />
            </div>
            <PaginatedCategorySelector
              value={formData.category || ''}
              onChange={(value) => setFormData({ ...formData, category: value })}
              label="Category"
              placeholder="Select category (optional)"
            />
            <PaginatedSubcategorySelector
              value={formData.subcategory || ''}
              onChange={(value) => setFormData({ ...formData, subcategory: value })}
              categoryName={formData.category}
              label="Subcategory"
              placeholder="Select subcategory (optional)"
            />
            <div className="grid gap-2">
              <Label htmlFor="badgeText">Badge Text</Label>
              <Input
                id="badgeText"
                value={formData.badgeText}
                onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                placeholder="e.g., NEW"
              />
            </div>
            <PaginatedProductSelector
              value={formData.productId}
              onChange={(value) => setFormData({ ...formData, productId: value })}
              label="Product"
              placeholder="Link to specific product (optional)"
            />
            <div className="grid gap-2">
              <Label htmlFor="position">Position (Display Order)</Label>
              <Input
                id="position"
                type="number"
                value={formData.position}
                onChange={(e) =>
                  setFormData({ ...formData, position: parseInt(e.target.value) || 0 })
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
              />
              <Label htmlFor="active">Active (Display on homepage)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateBanner}
              disabled={!formData.title || !formData.imageUrl || createMutation.isPending}
            >
              {createMutation.isPending ? 'Creating...' : 'Create Banner'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Banner Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Banner</DialogTitle>
            <DialogDescription>
              Update banner details. Fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-subtitle">Subtitle</Label>
              <Input
                id="edit-subtitle"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-imageUrl">
                Banner Image <span className="text-red-500">*</span>
              </Label>

              {/* File Upload Section */}
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {!imagePreview ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8 text-center hover:border-primary"
                  >
                    <Upload className="mb-2 h-8 w-8 text-gray-400" />
                    <p className="text-sm font-medium">Click to upload banner image</p>
                    <p className="text-xs text-muted-foreground">JPG, PNG, or WEBP (Max 10MB)</p>
                  </div>
                ) : (
                  <div className="relative overflow-hidden rounded-lg border">
                    <img src={imagePreview} alt="Preview" className="w-full object-cover" />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {selectedFile && !formData.imageUrl && (
                  <Button
                    type="button"
                    onClick={handleUploadImage}
                    disabled={isUploading}
                    className="w-full"
                  >
                    {isUploading ? 'Uploading...' : 'Upload Image'}
                  </Button>
                )}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-buttonText">Button Text</Label>
              <Input
                id="edit-buttonText"
                value={formData.buttonText}
                onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
              />
            </div>
            <PaginatedCategorySelector
              value={formData.category || ''}
              onChange={(value) => setFormData({ ...formData, category: value })}
              label="Category"
              placeholder="Select category (optional)"
            />
            <PaginatedSubcategorySelector
              value={formData.subcategory || ''}
              onChange={(value) => setFormData({ ...formData, subcategory: value })}
              categoryName={formData.category}
              label="Subcategory"
              placeholder="Select subcategory (optional)"
            />
            <div className="grid gap-2">
              <Label htmlFor="edit-badgeText">Badge Text</Label>
              <Input
                id="edit-badgeText"
                value={formData.badgeText}
                onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
              />
            </div>
            <PaginatedProductSelector
              value={formData.productId}
              onChange={(value) => setFormData({ ...formData, productId: value })}
              label="Product"
              placeholder="Link to specific product (optional)"
            />
            <div className="grid gap-2">
              <Label htmlFor="edit-position">Position (Display Order)</Label>
              <Input
                id="edit-position"
                type="number"
                value={formData.position}
                onChange={(e) =>
                  setFormData({ ...formData, position: parseInt(e.target.value) || 0 })
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="edit-active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
              />
              <Label htmlFor="edit-active">Active (Display on homepage)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateBanner}
              disabled={!formData.title || !formData.imageUrl || updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Updating...' : 'Update Banner'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the banner "{selectedBanner?.title}". This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBanner}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
