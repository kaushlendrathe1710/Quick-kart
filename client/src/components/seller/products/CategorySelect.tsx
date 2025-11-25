import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  getCategories,
  getSubcategoriesByCategoryId,
  type Category,
  type Subcategory,
} from '@/api/public/categories';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface CategorySelectProps {
  categoryId?: number | null;
  subcategoryId?: number | null;
  onCategoryChange: (categoryId: number, categoryName: string) => void;
  onSubcategoryChange: (subcategoryId: number | null) => void;
  required?: boolean;
  disabled?: boolean;
}

export function CategorySelect({
  categoryId,
  subcategoryId,
  onCategoryChange,
  onSubcategoryChange,
  required = true,
  disabled = false,
}: CategorySelectProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    categoryId?.toString()
  );
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | undefined>(
    subcategoryId?.toString() || 'none'
  );

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Load subcategories when category changes
  useEffect(() => {
    if (categoryId) {
      loadSubcategories(categoryId);
    } else {
      setSubcategories([]);
    }
  }, [categoryId]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await getCategories();
      console.log('Fetched categories:', response.data);
      setCategories(response.data.categories.filter((cat) => cat.isActive));
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const loadSubcategories = async (catId: number) => {
    try {
      setLoadingSubcategories(true);
      const response = await getSubcategoriesByCategoryId(catId);
      setSubcategories(response.data.filter((sub) => sub.active));
    } catch (error) {
      console.error('Error loading subcategories:', error);
      // Don't show error toast as subcategories are optional
      setSubcategories([]);
    } finally {
      setLoadingSubcategories(false);
    }
  };

  const handleCategoryChange = (value: string) => {
    const catId = parseInt(value);
    const category = categories.find((cat) => cat.id === catId);
    if (category) {
      setSelectedCategory(value);
      setSelectedSubcategory('none');
      onCategoryChange(catId, category.name);
      onSubcategoryChange(null);
      loadSubcategories(catId);
    }
  };

  const handleSubcategoryChange = (value: string) => {
    setSelectedSubcategory(value);
    if (value === 'none') {
      onSubcategoryChange(null);
    } else {
      onSubcategoryChange(parseInt(value));
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="category">
          Category {required && <span className="text-red-500">*</span>}
        </Label>
        <Select value={selectedCategory} onValueChange={handleCategoryChange} disabled={disabled}>
          <SelectTrigger id="category">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.length === 0 ? (
              <div className="px-4 py-2 text-sm text-muted-foreground">No categories available</div>
            ) : (
              categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {selectedCategory && (
        <div className="space-y-2">
          <Label htmlFor="subcategory">Subcategory (Optional)</Label>
          <Select
            value={selectedSubcategory}
            onValueChange={handleSubcategoryChange}
            disabled={disabled || loadingSubcategories}
          >
            <SelectTrigger id="subcategory">
              <SelectValue placeholder="Select a subcategory (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {loadingSubcategories ? (
                <div className="px-4 py-2 text-sm text-muted-foreground">Loading...</div>
              ) : subcategories.length === 0 ? (
                <div className="px-4 py-2 text-sm text-muted-foreground">
                  No subcategories available
                </div>
              ) : (
                subcategories.map((subcategory) => (
                  <SelectItem key={subcategory.id} value={subcategory.id.toString()}>
                    {subcategory.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
