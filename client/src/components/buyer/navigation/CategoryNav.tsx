import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/api/apiClient';
import { categoryKeys } from '@/constants/buyer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug: string;
  image?: string;
}

interface Subcategory {
  id: number;
  name: string;
  slug: string;
  categoryId: number;
  image?: string;
}

/**
 * Category Navigation - Categories with subcategory dropdowns
 */
export default function CategoryNav() {
  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: async () => {
      const response = await apiClient.get('/categories', {
        params: { page: 1, limit: 10, activeOnly: true },
      });
      return response.data.data;
    },
  });

  // Fetch all subcategories
  const { data: subcategoriesData } = useQuery({
    queryKey: ['subcategories', 'all'],
    queryFn: async () => {
      const response = await apiClient.get('/subcategories');
      return response.data.data as Subcategory[];
    },
  });

  const categories = categoriesData?.categories || [];
  const allSubcategories = subcategoriesData || [];

  // Group subcategories by category
  const subcategoriesByCategory = allSubcategories.reduce(
    (acc, sub) => {
      if (!acc[sub.categoryId]) {
        acc[sub.categoryId] = [];
      }
      acc[sub.categoryId].push(sub);
      return acc;
    },
    {} as Record<number, Subcategory[]>
  );

  return (
    <div className="border-b bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 overflow-x-auto py-2">
          {categories.map((category: Category) => {
            const subcategories = subcategoriesByCategory[category.id] || [];

            if (subcategories.length === 0) {
              // No subcategories - render as simple link
              return (
                <Link key={category.id} href={`/products?category=${category.id}`}>
                  <Button variant="ghost" size="sm" className="whitespace-nowrap">
                    {category.name}
                  </Button>
                </Link>
              );
            }

            // Has subcategories - render with dropdown
            return (
              <DropdownMenu key={category.id}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="whitespace-nowrap">
                    {category.name}
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {/* View All Category Link */}
                  <DropdownMenuItem asChild>
                    <Link href={`/products?category=${category.id}`}>
                      <a className="w-full font-medium text-primary">View All {category.name}</a>
                    </Link>
                  </DropdownMenuItem>

                  {/* Subcategories */}
                  {subcategories.map((subcategory) => (
                    <DropdownMenuItem key={subcategory.id} asChild>
                      <Link href={`/products?subcategory=${subcategory.id}`}>
                        <a className="w-full">{subcategory.name}</a>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            );
          })}
        </div>
      </div>
    </div>
  );
}
