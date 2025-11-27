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

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface PaginatedCategorySelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
}

export function PaginatedCategorySelector({
  value,
  onChange,
  label = 'Category',
  placeholder = 'Select category',
  required = false,
}: PaginatedCategorySelectorProps) {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const limit = 20;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['categories', page, searchQuery],
    queryFn: async () => {
      const response = await apiClient.get('/categories', {
        params: {
          page,
          limit,
          activeOnly: true,
          search: searchQuery || undefined,
        },
      });
      return response.data.data;
    },
    enabled: open,
  });

  // Accumulate categories as pages load
  useEffect(() => {
    if (data?.categories) {
      if (page === 1 || searchQuery) {
        // Reset list on first page or new search
        setAllCategories(data.categories);
      } else {
        // Append to existing list
        setAllCategories((prev) => {
          const existingIds = new Set(prev.map((cat) => cat.id));
          const newCategories = data.categories.filter((cat: Category) => !existingIds.has(cat.id));
          return [...prev, ...newCategories];
        });
      }
    }
  }, [data, page, searchQuery]);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const hasMorePages = data?.pagination?.hasNextPage || false;

  const handleLoadMore = () => {
    if (!isFetching && hasMorePages) {
      setPage((prev) => prev + 1);
    }
  };

  const selectedCategory = allCategories.find((cat) => cat.name === value);

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
          >
            {selectedCategory ? selectedCategory.name : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search categories..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              {isLoading && page === 1 ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : allCategories.length === 0 ? (
                <CommandEmpty>No categories found.</CommandEmpty>
              ) : (
                <>
                  <CommandGroup>
                    {allCategories.map((category) => (
                      <CommandItem
                        key={category.id}
                        value={category.name}
                        onSelect={(currentValue) => {
                          onChange(currentValue === value ? '' : currentValue);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            value === category.name ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        {category.name}
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
