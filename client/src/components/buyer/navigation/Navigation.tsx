import { Link, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { clearUser } from '@/store/slices/authSlice';
import { cartApi, authApi } from '@/api/buyer';
import { cartKeys } from '@/constants/buyer';
import { useWishlist } from '@/hooks/buyer';
import { guestCartUtils } from '@/utils/guestCart';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Heart, User, Package, LogOut, Search, Menu } from 'lucide-react';

/**
 * Navigation Component - Main buyer navigation
 */
export default function Navigation() {
  const [location, setLocation] = useLocation();
  const dispatch = useAppDispatch();
  const { currentUser, isAuthenticated } = useAppSelector((state) => state.auth);
  const { wishlistCount } = useWishlist();
  const [guestCartCount, setGuestCartCount] = useState(0);

  // Fetch cart count for authenticated users
  const { data: cartCount } = useQuery({
    queryKey: cartKeys.count(),
    queryFn: cartApi.getCartCount,
    enabled: isAuthenticated,
  });

  // Update guest cart count from localStorage
  useEffect(() => {
    if (!isAuthenticated) {
      const updateGuestCount = () => {
        setGuestCartCount(guestCartUtils.getCartCount());
      };

      updateGuestCount();

      // Listen for storage events (cart changes in other tabs)
      window.addEventListener('storage', updateGuestCount);

      // Custom event for same-tab cart updates
      window.addEventListener('guestCartUpdated', updateGuestCount);

      return () => {
        window.removeEventListener('storage', updateGuestCount);
        window.removeEventListener('guestCartUpdated', updateGuestCount);
      };
    }
  }, [isAuthenticated]);

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      dispatch(clearUser());
      toast.success('Logged out successfully');
      setLocation('/auth');
    },
    onError: (error: any) => {
      toast.error(error || 'Failed to logout');
    },
  });

  const handleLogout = async () => {
    logoutMutation.mutate();
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/">
          <a className="text-2xl font-bold text-primary">Quick-kart</a>
        </Link>
        {/* Search Bar */}
        <div className="mx-8 hidden max-w-xl flex-1 md:flex">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Search products..."
              className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value) {
                  setLocation(`/products?search=${encodeURIComponent(e.currentTarget.value)}`);
                }
              }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Wishlist */}
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation('/wishlist')}
              className="relative"
            >
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-xs">
                  {wishlistCount}
                </Badge>
              )}
            </Button>
          )}

          {/* Cart */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation('/cart')}
            className="relative"
          >
            <ShoppingCart className="h-5 w-5" />
            {((isAuthenticated && cartCount && cartCount.count > 0) ||
              (!isAuthenticated && guestCartCount > 0)) && (
              <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-xs">
                {isAuthenticated ? cartCount?.count || 0 : guestCartCount}
              </Badge>
            )}
          </Button>

          {/* User Menu */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentUser?.avatar || undefined} />
                    <AvatarFallback>{currentUser?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{currentUser?.name || 'User'}</p>
                    <p className="text-xs text-gray-500">{currentUser?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLocation('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation('/orders')}>
                  <Package className="mr-2 h-4 w-4" />
                  Orders
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => setLocation('/auth')}>Login</Button>
          )}

          {/* Mobile Menu */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
