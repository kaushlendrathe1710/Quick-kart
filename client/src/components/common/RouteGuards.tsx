import { ReactNode, useEffect } from 'react';
import { useLocation, Redirect } from 'wouter';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { toast } from 'sonner';

/**
 * Role-Based Route Guards
 * Protects routes based on user role and authentication status
 * Uses unified auth slice for all user types
 */

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'user' | 'seller' | 'admin' | 'delivery_partner';
  requireAuth?: boolean;
}

/**
 * Protected Route Component
 * Checks authentication and role before rendering children
 */
export function ProtectedRoute({
  children,
  requiredRole,
  requireAuth = true,
}: ProtectedRouteProps) {
  const [location, setLocation] = useLocation();
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const userRole = currentUser?.role;

  useEffect(() => {
    // If auth required but not authenticated, redirect to login
    if (requireAuth && !isAuthenticated) {
      toast.error('Please login to continue');
      setLocation('/auth');
      return;
    }

    // If role required but doesn't match, redirect appropriately
    if (requiredRole && userRole && userRole !== requiredRole) {
      if (userRole === 'seller') {
        toast.error('Access denied. Sellers cannot access buyer features.');
        setLocation('/seller/dashboard');
      } else if (userRole === 'user') {
        toast.error('Access denied. Buyers cannot access seller features.');
        setLocation('/');
      }
    }
  }, [isAuthenticated, userRole, requiredRole, requireAuth, location, setLocation]);

  // Show nothing while redirecting
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (requiredRole && userRole && userRole !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Seller Route Guard
 * Ensures only authenticated sellers with required approval can access
 */
interface SellerRouteProps {
  children: ReactNode;
  requireApproval?: boolean;
}

export function SellerRoute({ children, requireApproval = true }: SellerRouteProps) {
  const [, setLocation] = useLocation();
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated || !currentUser) {
      toast.error('Please login as a seller to continue');
      setLocation('/auth');
      return;
    }

    if (currentUser.role !== 'seller') {
      toast.error('Access denied. Only sellers can access this area.');
      setLocation('/');
      return;
    }

    if (requireApproval && !currentUser.isApproved) {
      // Allow access to approval check page but restrict other features
      const allowedPaths = ['/seller/dashboard', '/seller/profile', '/seller/settings'];
      if (!allowedPaths.some((path) => window.location.pathname.startsWith(path))) {
        toast.warning('Your seller account is pending approval');
        setLocation('/seller/dashboard');
      }
    }
  }, [currentUser, isAuthenticated, requireApproval, setLocation]);

  if (!isAuthenticated || !currentUser || currentUser.role !== 'seller') {
    return null;
  }

  return <>{children}</>;
}

/**
 * Buyer Route Guard
 * Ensures only authenticated buyers can access
 */
export function BuyerRoute({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated || !currentUser) {
      toast.error('Please login to continue');
      setLocation('/auth');
      return;
    }

    if (currentUser.role !== 'user') {
      toast.error('Access denied. Sellers cannot access buyer features.');
      setLocation('/seller/dashboard');
    }
  }, [currentUser, isAuthenticated, setLocation]);

  if (!isAuthenticated || !currentUser || currentUser.role !== 'user') {
    return null;
  }

  return <>{children}</>;
}

/**
 * Admin Route Guard
 * Ensures only authenticated admins can access
 */
export function AdminRoute({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated || !currentUser) {
      toast.error('Please login to continue');
      setLocation('/auth');
      return;
    }

    if (currentUser.role !== 'admin') {
      toast.error('Access denied. Only admins can access this area.');
      if (currentUser.role === 'seller') {
        setLocation('/seller/dashboard');
      } else {
        setLocation('/');
      }
    }
  }, [currentUser, isAuthenticated, setLocation]);

  if (!isAuthenticated || !currentUser || currentUser.role !== 'admin') {
    return null;
  }

  return <>{children}</>;
}

/**
 * Public Route Component
 * For routes accessible without authentication
 */
export function PublicRoute({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

/**
 * Auth Redirect Component
 * Redirects authenticated users based on their role
 * Does not redirect if profile completion is required
 */
export function AuthRedirect() {
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const requiresProfile = useSelector((state: RootState) => state.auth.requiresProfile);

  // Don't redirect if user needs to complete profile
  if (requiresProfile) {
    return null;
  }

  // Redirect admins to admin dashboard
  if (isAuthenticated && currentUser?.role === 'admin') {
    return <Redirect to="/admin/dashboard" />;
  }

  // Redirect sellers to dashboard
  if (isAuthenticated && currentUser?.role === 'seller') {
    return <Redirect to="/seller/dashboard" />;
  }

  // Redirect buyers to homepage
  if (isAuthenticated && currentUser?.role === 'user') {
    return <Redirect to="/" />;
  }

  // Not authenticated, stay on auth page
  return null;
}
