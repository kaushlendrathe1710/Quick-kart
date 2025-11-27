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

interface Product {
  id: number;
  name: string;
  slug: string;
}

interface PaginatedProductSelectorProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
}

export function PaginatedProductSelector({
  value,
  onChange,
  label = 'Product',
  placeholder = 'Select product',
  required = false,
}: PaginatedProductSelectorProps) {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const limit = 20;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['products', page, searchQuery],
    queryFn: async () => {
      const response = await apiClient.get('/products', {
        params: {
          page,
          limit,
          search: searchQuery || undefined,
          sortBy: 'name',
          sortOrder: 'asc',
        },
      });
      return response.data.data;
    },
    enabled: open,
  });

  // Accumulate products as pages load
  useEffect(() => {
    if (data?.products) {
      if (page === 1 || searchQuery) {
        // Reset list on first page or new search
        setAllProducts(data.products);
      } else {
        // Append to existing list
        setAllProducts((prev) => {
          const existingIds = new Set(prev.map((prod) => prod.id));
          const newProducts = data.products.filter((prod: Product) => !existingIds.has(prod.id));
          return [...prev, ...newProducts];
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

  const selectedProduct = allProducts.find((prod) => prod.id === value);

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
            {selectedProduct ? selectedProduct.name : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search products..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              {isLoading && page === 1 ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : allProducts.length === 0 ? (
                <CommandEmpty>No products found.</CommandEmpty>
              ) : (
                <>
                  <CommandGroup>
                    {allProducts.map((product) => (
                      <CommandItem
                        key={product.id}
                        value={product.id.toString()}
                        onSelect={() => {
                          onChange(value === product.id ? undefined : product.id);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            value === product.id ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        {product.name}
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
