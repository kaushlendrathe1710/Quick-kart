import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/hooks/buyer';
import { cn } from '@/lib/utils';

interface HeartButtonProps {
  productId: number;
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'secondary' | 'outline' | 'ghost';
  showOnHoverOnly?: boolean;
  iconClassName?: string;
}

/**
 * Reusable heart button component for wishlist functionality
 * Uses the centralized useWishlist hook
 */
export function HeartButton({
  productId,
  className,
  size = 'icon',
  variant = 'secondary',
  showOnHoverOnly = false,
  iconClassName,
}: HeartButtonProps) {
  const { isInWishlist, toggleWishlist, isTogglingWishlist, isAuthenticated } = useWishlist();

  const inWishlist = isInWishlist(productId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(productId);
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        'transition-all',
        showOnHoverOnly && !inWishlist && 'opacity-0 group-hover:opacity-100',
        inWishlist && 'opacity-100',
        className
      )}
      onClick={handleClick}
      disabled={isTogglingWishlist || !isAuthenticated}
      aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart
        className={cn(
          'transition-colors',
          inWishlist && 'fill-red-500 text-red-500',
          iconClassName
        )}
      />
    </Button>
  );
}
