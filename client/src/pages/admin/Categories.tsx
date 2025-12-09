import { useState } from 'react';
import { AdminLayout } from '@/components/admin/navigation/AdminLayout';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useSubcategories,
  useCreateSubcategory,
  useUpdateSubcategory,
  useDeleteSubcategory,
} from '@/hooks/admin';
import type { Category, Subcategory } from '@/api/admin/categories';
import { uploadCategoryIcon, uploadSubcategoryImage } from '@/api/admin/categories';
import { ImageUpload } from '@/components/common/ImageUpload';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  FolderTree,
  Tags,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

/**
 * Admin Categories Management Page
 * Manage categories and subcategories with image uploads and pagination
 */

export default function AdminCategoriesPage() {
  const [activeTab, setActiveTab] = useState('categories');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination state for subcategories
  const [subcategoryPage, setSubcategoryPage] = useState(1);
  const [subcategoryLimit] = useState(10);
  const [filterCategoryId, setFilterCategoryId] = useState<number | undefined>(undefined);

  // Category state
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [categoryDeleteDialogOpen, setCategoryDeleteDialogOpen] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    icon: '',
    isActive: true,
  });
  const [categoryIconFile, setCategoryIconFile] = useState<File | null>(null);
  const [isUploadingCategoryIcon, setIsUploadingCategoryIcon] = useState(false);

  // Subcategory state
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [subcategoryDialogOpen, setSubcategoryDialogOpen] = useState(false);
  const [subcategoryDeleteDialogOpen, setSubcategoryDeleteDialogOpen] = useState(false);
  const [subcategoryFormData, setSubcategoryFormData] = useState({
    name: '',
    categoryId: 0,
    description: '',
    image: '',
    active: true,
  });
  const [subcategoryImageFile, setSubcategoryImageFile] = useState<File | null>(null);
  const [isUploadingSubcategoryImage, setIsUploadingSubcategoryImage] = useState(false);

  // Fetch data
  const { data: categories = [], isLoading: isLoadingCategories } = useCategories();
  const { data: subcategoryData, isLoading: isLoadingSubcategories } = useSubcategories({
    page: subcategoryPage,
    limit: subcategoryLimit,
    categoryId: filterCategoryId,
  });

  const subcategories = subcategoryData?.subcategories || [];
  const subcategoryPagination = subcategoryData?.pagination;

  // Mutations
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();
  const createSubcategoryMutation = useCreateSubcategory();
  const updateSubcategoryMutation = useUpdateSubcategory();
  const deleteSubcategoryMutation = useDeleteSubcategory();

  // Filter categories by search
  const filteredCategories = categories.filter((cat: Category) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Category handlers
  const handleOpenCategoryDialog = (category?: Category) => {
    if (category) {
      setSelectedCategory(category);
      setCategoryFormData({
        name: category.name,
        description: category.description || '',
        icon: category.icon || '',
        isActive: category.isActive,
      });
    } else {
      setSelectedCategory(null);
      setCategoryFormData({
        name: '',
        description: '',
        icon: '',
        isActive: true,
      });
    }
    setCategoryIconFile(null);
    setCategoryDialogOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryFormData.name.trim()) return;

    let iconUrl = categoryFormData.icon;

    // Upload icon if a new file is selected
    if (categoryIconFile) {
      setIsUploadingCategoryIcon(true);
      try {
        const response = await uploadCategoryIcon(categoryIconFile);
        iconUrl = response.imageUrl;
      } catch (error: any) {
        toast.error(error?.response?.data?.error || 'Failed to upload icon');
        setIsUploadingCategoryIcon(false);
        return;
      }
      setIsUploadingCategoryIcon(false);
    }

    const dataToSave = { ...categoryFormData, icon: iconUrl };

    if (selectedCategory) {
      updateCategoryMutation.mutate(
        { id: selectedCategory.id, data: dataToSave },
        {
          onSuccess: () => {
            setCategoryDialogOpen(false);
            setSelectedCategory(null);
            setCategoryIconFile(null);
          },
        }
      );
    } else {
      createCategoryMutation.mutate(dataToSave, {
        onSuccess: () => {
          setCategoryDialogOpen(false);
          setCategoryIconFile(null);
        },
      });
    }
  };

  const handleDeleteCategory = () => {
    if (!selectedCategory) return;
    deleteCategoryMutation.mutate(selectedCategory.id, {
      onSuccess: () => {
        setCategoryDeleteDialogOpen(false);
        setSelectedCategory(null);
      },
    });
  };

  // Subcategory handlers
  const handleOpenSubcategoryDialog = (subcategory?: Subcategory) => {
    if (subcategory) {
      setSelectedSubcategory(subcategory);
      setSubcategoryFormData({
        name: subcategory.name,
        categoryId: subcategory.categoryId,
        description: subcategory.description || '',
        image: subcategory.image || '',
        active: subcategory.active,
      });
    } else {
      setSelectedSubcategory(null);
      setSubcategoryFormData({
        name: '',
        categoryId: categories[0]?.id || 0,
        description: '',
        image: '',
        active: true,
      });
    }
    setSubcategoryImageFile(null);
    setSubcategoryDialogOpen(true);
  };

  const handleSaveSubcategory = async () => {
    if (!subcategoryFormData.name.trim() || !subcategoryFormData.categoryId) return;

    let imageUrl = subcategoryFormData.image;

    // Upload image if a new file is selected
    if (subcategoryImageFile) {
      setIsUploadingSubcategoryImage(true);
      try {
        const response = await uploadSubcategoryImage(subcategoryImageFile);
        imageUrl = response.imageUrl;
      } catch (error: any) {
        toast.error(error?.response?.data?.error || 'Failed to upload image');
        setIsUploadingSubcategoryImage(false);
        return;
      }
      setIsUploadingSubcategoryImage(false);
    }

    const dataToSave = { ...subcategoryFormData, image: imageUrl };

    if (selectedSubcategory) {
      updateSubcategoryMutation.mutate(
        { id: selectedSubcategory.id, data: dataToSave },
        {
          onSuccess: () => {
            setSubcategoryDialogOpen(false);
            setSelectedSubcategory(null);
            setSubcategoryImageFile(null);
          },
        }
      );
    } else {
      createSubcategoryMutation.mutate(dataToSave, {
        onSuccess: () => {
          setSubcategoryDialogOpen(false);
          setSubcategoryImageFile(null);
        },
      });
    }
  };

  const handleDeleteSubcategory = () => {
    if (!selectedSubcategory) return;
    deleteSubcategoryMutation.mutate(selectedSubcategory.id, {
      onSuccess: () => {
        setSubcategoryDeleteDialogOpen(false);
        setSelectedSubcategory(null);
      },
    });
  };

  const getCategoryName = (categoryId: number) => {
    return categories.find((cat: Category) => cat.id === categoryId)?.name || 'Unknown';
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories & Subcategories</h1>
          <p className="text-muted-foreground">Manage product categories and subcategories</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
              <FolderTree className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categories.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Subcategories</CardTitle>
              <Tags className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{subcategoryPagination?.total || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="subcategories">Subcategories</TabsTrigger>
          </TabsList>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="relative max-w-sm flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={() => handleOpenCategoryDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                {isLoadingCategories ? (
                  <div className="space-y-3 p-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : filteredCategories.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FolderTree className="mb-4 h-12 w-12 text-muted-foreground" />
                    <h3 className="mb-2 text-lg font-semibold">No categories found</h3>
                    <p className="mb-4 text-sm text-muted-foreground">
                      {searchQuery
                        ? 'Try adjusting your search'
                        : 'Get started by creating your first category'}
                    </p>
                    {!searchQuery && (
                      <Button onClick={() => handleOpenCategoryDialog()}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Category
                      </Button>
                    )}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Icon</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCategories.map((category: Category) => (
                        <TableRow key={category.id}>
                          <TableCell>
                            {category.image ? (
                              <img
                                src={category.image}
                                alt={category.name}
                                className="h-10 w-10 rounded object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
                                <FolderTree className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{category.name}</TableCell>
                          <TableCell className="max-w-md truncate">
                            {category.description || '-'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={category.isActive ? 'default' : 'secondary'}>
                              {category.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenCategoryDialog(category)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedCategory(category);
                                  setCategoryDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subcategories Tab */}
          <TabsContent value="subcategories" className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-1 items-center gap-3">
                <Select
                  value={filterCategoryId?.toString() || 'all'}
                  onValueChange={(value) => {
                    setFilterCategoryId(value === 'all' ? undefined : parseInt(value));
                    setSubcategoryPage(1); // Reset to first page when filter changes
                  }}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat: Category) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={() => handleOpenSubcategoryDialog()}
                disabled={categories.length === 0}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Subcategory
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                {isLoadingSubcategories ? (
                  <div className="space-y-3 p-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : subcategories.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Tags className="mb-4 h-12 w-12 text-muted-foreground" />
                    <h3 className="mb-2 text-lg font-semibold">No subcategories found</h3>
                    <p className="mb-4 text-sm text-muted-foreground">
                      {filterCategoryId
                        ? 'No subcategories in this category'
                        : categories.length === 0
                          ? 'Create a category first'
                          : 'Get started by creating your first subcategory'}
                    </p>
                    {categories.length > 0 && (
                      <Button onClick={() => handleOpenSubcategoryDialog()}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Subcategory
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Image</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {subcategories.map((subcategory: Subcategory) => (
                          <TableRow key={subcategory.id}>
                            <TableCell>
                              {subcategory.image ? (
                                <img
                                  src={subcategory.image}
                                  alt={subcategory.name}
                                  className="h-10 w-10 rounded object-cover"
                                />
                              ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
                                  <Tags className="h-5 w-5 text-muted-foreground" />
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="font-medium">{subcategory.name}</TableCell>
                            <TableCell>{getCategoryName(subcategory.categoryId)}</TableCell>
                            <TableCell className="max-w-md truncate">
                              {subcategory.description || '-'}
                            </TableCell>
                            <TableCell>
                              <Badge variant={subcategory.active ? 'default' : 'secondary'}>
                                {subcategory.active ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenSubcategoryDialog(subcategory)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedSubcategory(subcategory);
                                    setSubcategoryDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    {/* Pagination Controls */}
                    {subcategoryPagination && subcategoryPagination.totalPages > 1 && (
                      <div className="flex items-center justify-between border-t px-4 py-3">
                        <div className="text-sm text-muted-foreground">
                          Showing{' '}
                          {(subcategoryPagination.page - 1) * subcategoryPagination.limit + 1} to{' '}
                          {Math.min(
                            subcategoryPagination.page * subcategoryPagination.limit,
                            subcategoryPagination.total
                          )}{' '}
                          of {subcategoryPagination.total} results
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSubcategoryPage((p) => Math.max(1, p - 1))}
                            disabled={subcategoryPage === 1}
                          >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                          </Button>
                          <div className="text-sm">
                            Page {subcategoryPagination.page} of {subcategoryPagination.totalPages}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setSubcategoryPage((p) =>
                                Math.min(subcategoryPagination.totalPages, p + 1)
                              )
                            }
                            disabled={subcategoryPage === subcategoryPagination.totalPages}
                          >
                            Next
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Category Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedCategory ? 'Edit Category' : 'Create Category'}</DialogTitle>
            <DialogDescription>
              {selectedCategory ? 'Update category details' : 'Add a new category'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="cat-name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="cat-name"
                value={categoryFormData.name}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                placeholder="e.g., Electronics"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cat-description">Description</Label>
              <Textarea
                id="cat-description"
                value={categoryFormData.description}
                onChange={(e) =>
                  setCategoryFormData({ ...categoryFormData, description: e.target.value })
                }
                placeholder="Category description..."
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label>Category Icon</Label>
              <ImageUpload
                value={categoryFormData.icon}
                onChange={(file, previewUrl) => {
                  setCategoryIconFile(file);
                  if (previewUrl) {
                    setCategoryFormData({ ...categoryFormData, icon: previewUrl });
                  }
                }}
                maxSizeMB={0.5}
                recommendedAspectRatio="1:1 (Square)"
                recommendedDimensions="256x256px"
                acceptedFormats={['JPG', 'PNG', 'WEBP', 'SVG']}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="cat-active"
                checked={categoryFormData.isActive}
                onCheckedChange={(checked) =>
                  setCategoryFormData({ ...categoryFormData, isActive: checked })
                }
              />
              <Label htmlFor="cat-active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveCategory}
              disabled={
                !categoryFormData.name.trim() ||
                createCategoryMutation.isPending ||
                updateCategoryMutation.isPending ||
                isUploadingCategoryIcon
              }
            >
              {isUploadingCategoryIcon ? 'Uploading...' : selectedCategory ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subcategory Dialog */}
      <Dialog open={subcategoryDialogOpen} onOpenChange={setSubcategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedSubcategory ? 'Edit Subcategory' : 'Create Subcategory'}
            </DialogTitle>
            <DialogDescription>
              {selectedSubcategory ? 'Update subcategory details' : 'Add a new subcategory'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="sub-name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="sub-name"
                value={subcategoryFormData.name}
                onChange={(e) =>
                  setSubcategoryFormData({ ...subcategoryFormData, name: e.target.value })
                }
                placeholder="e.g., Smartphones"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sub-category">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select
                value={subcategoryFormData.categoryId.toString()}
                onValueChange={(value) =>
                  setSubcategoryFormData({ ...subcategoryFormData, categoryId: parseInt(value) })
                }
              >
                <SelectTrigger id="sub-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat: Category) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sub-description">Description</Label>
              <Textarea
                id="sub-description"
                value={subcategoryFormData.description}
                onChange={(e) =>
                  setSubcategoryFormData({ ...subcategoryFormData, description: e.target.value })
                }
                placeholder="Subcategory description..."
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label>Subcategory Image</Label>
              <ImageUpload
                value={subcategoryFormData.image}
                onChange={(file, previewUrl) => {
                  setSubcategoryImageFile(file);
                  if (previewUrl) {
                    setSubcategoryFormData({ ...subcategoryFormData, image: previewUrl });
                  }
                }}
                maxSizeMB={1}
                recommendedAspectRatio="1:1 (Square)"
                recommendedDimensions="512x512px"
                acceptedFormats={['JPG', 'PNG', 'WEBP']}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="sub-active"
                checked={subcategoryFormData.active}
                onCheckedChange={(checked) =>
                  setSubcategoryFormData({ ...subcategoryFormData, active: checked })
                }
              />
              <Label htmlFor="sub-active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubcategoryDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveSubcategory}
              disabled={
                !subcategoryFormData.name.trim() ||
                !subcategoryFormData.categoryId ||
                createSubcategoryMutation.isPending ||
                updateSubcategoryMutation.isPending ||
                isUploadingSubcategoryImage
              }
            >
              {isUploadingSubcategoryImage
                ? 'Uploading...'
                : selectedSubcategory
                  ? 'Update'
                  : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Dialog */}
      <AlertDialog open={categoryDeleteDialogOpen} onOpenChange={setCategoryDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the category "{selectedCategory?.name}". This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteCategoryMutation.isPending}
            >
              {deleteCategoryMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Subcategory Dialog */}
      <AlertDialog open={subcategoryDeleteDialogOpen} onOpenChange={setSubcategoryDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the subcategory "{selectedSubcategory?.name}". This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSubcategory}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteSubcategoryMutation.isPending}
            >
              {deleteSubcategoryMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
