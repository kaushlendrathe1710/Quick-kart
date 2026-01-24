import { ReactNode, useMemo } from 'react';
import { Link, useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearUser } from '@/store/slices/authSlice';
import { authApi } from '@/api/buyer';
import { needsApproval } from '@/utils/approval';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Warehouse,
  User,
  Settings,
  ChevronDown,
  LogOut,
  Bell,
  Menu,
  X,
  Wallet,
  FileText,
  LifeBuoy,
} from 'lucide-react';
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
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useSellerProfile } from '@/hooks/seller';

/**
 * Seller Portal Layout
 * Main layout wrapper for seller pages with sidebar navigation
 */

interface SellerLayoutProps {
  children: ReactNode;
}

export function SellerLayout({ children }: SellerLayoutProps) {
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: profileData } = useSellerProfile();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.currentUser);

  // Determine if seller needs approval
  const showApplicationSubmission = useMemo(() => needsApproval(currentUser), [currentUser]);

  // Dynamic navigation items based on approval status
  const navigationItems = useMemo(() => {
    const baseItems = [
      {
        label: 'Dashboard',
        href: '/seller/dashboard',
        icon: LayoutDashboard,
      },
      {
        label: 'Profile',
        href: '/seller/profile',
        icon: User,
      },
    ];

    // If seller needs approval, show application submission
    if (showApplicationSubmission) {
      return [
        ...baseItems,
        {
          label: 'Submit Application',
          href: '/seller/application',
          icon: FileText,
        },
      ];
    }

    // If approved, show all features
    return [
      ...baseItems,
      {
        label: 'Store',
        href: '/seller/store',
        icon: Settings,
      },
      {
        label: 'Products',
        href: '/seller/products',
        icon: Package,
      },
      {
        label: 'Orders',
        href: '/seller/orders',
        icon: ShoppingCart,
      },
      {
        label: 'Deliveries',
        href: '/seller/deliveries',
        icon: Package,
      },
      {
        label: 'Inventory',
        href: '/seller/inventory',
        icon: Warehouse,
      },
      {
        label: 'Analytics',
        href: '/seller/analytics',
        icon: BarChart3,
      },
      {
        label: 'Wallet',
        href: '/seller/wallet',
        icon: Wallet,
      },
      {
        label: 'Support Tickets',
        href: '/seller/tickets',
        icon: LifeBuoy,
      },
    ];
  }, [showApplicationSubmission]);

  const seller = (profileData as any)?.data?.user;

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

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
        <div className="flex h-16 items-center gap-4 px-4 md:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          <Link href="/seller/dashboard">
            <a className="flex items-center gap-2 font-semibold">
              <Package className="h-6 w-6" />
              <span className="hidden sm:inline-block">Quick-kart Seller</span>
            </a>
          </Link>

          <div className="ml-auto flex items-center gap-4">
            {/* Approval Status Badge */}
            {seller && !seller.isApproved && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                Pending Approval
              </Badge>
            )}

            {/* Notifications */}
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={seller?.avatar || undefined} />
                    <AvatarFallback>{seller?.name?.charAt(0).toUpperCase() || 'S'}</AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline-block">{seller?.name || seller?.email}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{seller?.name || 'Seller'}</p>
                    <p className="text-xs leading-none text-muted-foreground">{seller?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/seller/profile">
                    <a className="flex w-full gap-1">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </a>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/seller/settings">
                    <a className="flex w-full gap-1">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </a>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-40 w-64 border-r bg-white transition-transform md:sticky md:block',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          )}
        >
          <nav className="space-y-1 p-4">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;

              return (
                <Link key={item.href} href={item.href}>
                  <span
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
