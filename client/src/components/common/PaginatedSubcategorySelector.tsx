import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/api/apiClient';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface Subcategory {
  id: number;
  name: string;
  slug: string;
  categoryId: number;
}

interface PaginatedSubcategorySelectorProps {
  value: string;
  onChange: (value: string) => void;
  categoryName?: string; // Filter by category name
  label?: string;
  placeholder?: string;
  required?: boolean;
}

export function PaginatedSubcategorySelector({
  value,
  onChange,
  categoryName,
  label = 'Subcategory',
  placeholder = 'Select subcategory',
  required = false,
}: PaginatedSubcategorySelectorProps) {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [allSubcategories, setAllSubcategories] = useState<Subcategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const limit = 20;

  // First, get the category ID from the category name if provided
  const { data: categoryData } = useQuery({
    queryKey: ['category-by-name', categoryName],
    queryFn: async () => {
      if (!categoryName) return null;
      const response = await apiClient.get('/categories', {
        params: { search: categoryName, limit: 1 },
      });
      return response.data.data?.categories?.[0] || null;
    },
    enabled: !!categoryName && open,
  });

  const categoryId = categoryData?.id;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['subcategories', categoryId, page, searchQuery],
    queryFn: async () => {
      if (categoryId) {
        // Get subcategories for specific category
        const response = await apiClient.get(`/categories/${categoryId}/subcategories`, {
          params: {
            page,
            limit,
            search: searchQuery || undefined,
          },
        });
        return { subcategories: response.data.data, pagination: { hasNextPage: false } };
      } else {
        // Get all subcategories with pagination (if endpoint supports it)
        const response = await apiClient.get('/subcategories', {
          params: {
            page,
            limit,
            search: searchQuery || undefined,
          },
        });
        return response.data.data;
      }
    },
    enabled: open,
  });

  // Accumulate subcategories as pages load
  useEffect(() => {
    if (data?.subcategories) {
      if (page === 1 || searchQuery) {
        // Reset list on first page or new search
        setAllSubcategories(data.subcategories);
      } else {
        // Append to existing list
        setAllSubcategories((prev) => {
          const existingIds = new Set(prev.map((sub) => sub.id));
          const newSubcategories = data.subcategories.filter(
            (sub: Subcategory) => !existingIds.has(sub.id)
          );
          return [...prev, ...newSubcategories];
        });
      }
    }
  }, [data, page, searchQuery]);

  // Reset page when search or category changes
  useEffect(() => {
    setPage(1);
    setAllSubcategories([]);
  }, [searchQuery, categoryId]);

  const hasMorePages = data?.pagination?.hasNextPage || false;

  const handleLoadMore = () => {
    if (!isFetching && hasMorePages) {
      setPage((prev) => prev + 1);
    }
  };

  const selectedSubcategory = allSubcategories.find((sub) => sub.name === value);

  return (
    <div className="space-y-2">
      {label && (
        <Label>
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={!!(categoryName && !categoryId && open)}
          >
            {selectedSubcategory ? selectedSubcategory.name : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search subcategories..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              {isLoading && page === 1 ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : allSubcategories.length === 0 ? (
                <CommandEmpty>
                  {categoryName
                    ? 'No subcategories found for this category.'
                    : 'No subcategories found.'}
                </CommandEmpty>
              ) : (
                <>
                  <CommandGroup>
                    {allSubcategories.map((subcategory) => (
                      <CommandItem
                        key={subcategory.id}
                        value={subcategory.name}
                        onSelect={(currentValue) => {
                          onChange(currentValue === value ? '' : currentValue);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            value === subcategory.name ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        {subcategory.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  {hasMorePages && (
                    <div className="border-t p-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLoadMore}
                        disabled={isFetching}
                        className="w-full"
                      >
                        {isFetching ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          'Load More'
                        )}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
