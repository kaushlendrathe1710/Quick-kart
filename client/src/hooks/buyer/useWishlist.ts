import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { wishlistApi } from '@/api/buyer';
import { wishlistKeys } from '@/constants/buyer';
import { useAppSelector } from '@/store/hooks';

/**
 * Custom hook for managing wishlist with optimistic updates
 * Provides centralized wishlist state management across the app
 */
export function useWishlist() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // Fetch wishlist data
  const {
    data: wishlistData,
    isLoading: isLoadingWishlist,
    error: wishlistError,
  } = useQuery({
    queryKey: wishlistKeys.all,
    queryFn: wishlistApi.getWishlist,
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Fetch wishlist count
  const { data: wishlistCount } = useQuery({
    queryKey: wishlistKeys.count(),
    queryFn: wishlistApi.getWishlistCount,
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  });

  /**
   * Check if a product is in the wishlist
   */
  const isInWishlist = (productId: number): boolean => {
    if (!isAuthenticated || !wishlistData?.data) return false;
    return wishlistData.data.some((item: any) => item.productId === productId);
  };

  /**
   * Toggle wishlist mutation with optimistic updates
   */
  const toggleWishlistMutation = useMutation({
    mutationFn: async (productId: number) => {
      const inWishlist = isInWishlist(productId);
      if (inWishlist) {
        return wishlistApi.removeFromWishlist(productId);
      } else {
        return wishlistApi.addToWishlist({ productId });
      }
    },
    // Optimistic update: Update cache immediately
    onMutate: async (productId: number) => {
      const inWishlist = isInWishlist(productId);

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: wishlistKeys.all });
      await queryClient.cancelQueries({ queryKey: wishlistKeys.count() });

      // Snapshot previous values for rollback
      const previousWishlist = queryClient.getQueryData(wishlistKeys.all);
      const previousCount = queryClient.getQueryData(wishlistKeys.count());

      // Optimistically update the cache
      queryClient.setQueryData(wishlistKeys.all, (old: any) => {
        if (!old?.data) return old;

        if (inWishlist) {
          // Remove from wishlist
          return {
            ...old,
            data: old.data.filter((item: any) => item.productId !== productId),
            pagination: {
              ...old.pagination,
              total: Math.max(0, (old.pagination?.total || 0) - 1),
            },
          };
        } else {
          // Add to wishlist (create placeholder item)
          return {
            ...old,
            data: [...old.data, { productId, id: Date.now() }],
            pagination: {
              ...old.pagination,
              total: (old.pagination?.total || 0) + 1,
            },
          };
        }
      });

      // Update count optimistically
      queryClient.setQueryData(wishlistKeys.count(), (old: any) => {
        if (!old) return old;
        return {
          count: inWishlist ? Math.max(0, old.count - 1) : old.count + 1,
        };
      });

      // Return context for rollback
      return { previousWishlist, previousCount, inWishlist };
    },
    // On error, rollback to previous state
    onError: (error: any, productId, context) => {
      if (context?.previousWishlist) {
        queryClient.setQueryData(wishlistKeys.all, context.previousWishlist);
      }
      if (context?.previousCount) {
        queryClient.setQueryData(wishlistKeys.count(), context.previousCount);
      }
      toast.error(error?.message || 'Failed to update wishlist');
    },
    // On success, show toast and invalidate to sync with server
    onSuccess: (data, productId, context) => {
      if (context?.inWishlist) {
        toast.success('Removed from wishlist');
      } else {
        toast.success('Added to wishlist');
      }
    },
    // Always refetch from server after mutation settles
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: wishlistKeys.all });
      queryClient.invalidateQueries({ queryKey: wishlistKeys.count() });
    },
  });

  /**
   * Toggle wishlist with authentication check
   */
  const toggleWishlist = (productId: number) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist');
      return;
    }
    toggleWishlistMutation.mutate(productId);
  };

  return {
    // Data
    wishlist: wishlistData?.data || [],
    wishlistCount: wishlistCount?.count || 0,

    // State
    isLoadingWishlist,
    isTogglingWishlist: toggleWishlistMutation.isPending,
    wishlistError,

    // Functions
    isInWishlist,
    toggleWishlist,

    // Authentication
    isAuthenticated,
  };
}
