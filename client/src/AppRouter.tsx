import { Route, Switch } from 'wouter';
import {
  BuyerRoute,
  SellerRoute,
  PublicRoute,
  AuthRedirect,
} from './components/common/RouteGuards';

// Buyer Pages
import HomePage from './pages/buyer/home/HomePage';
import ProductsPage from './pages/buyer/products/ProductsPage';
import ProductDetailsPage from './pages/buyer/product-details/ProductDetailsPage';
import CartPage from './pages/buyer/cart/CartPage';
import WishlistPage from './pages/buyer/wishlist/WishlistPage';
import CheckoutPage from './pages/buyer/checkout/CheckoutPage';
import OrdersPage from './pages/buyer/orders/OrdersPage';
import OrderDetailsPage from './pages/buyer/orders/OrderDetailsPage';
import ProfilePage from './pages/buyer/profile/ProfilePage';
import AuthPage from './pages/buyer/auth/AuthPage';

// Seller Pages
import SellerDashboardPage from './pages/seller/Dashboard';
import SellerProductsPage from './pages/seller/Products';
import SellerAddProductPage from './pages/seller/AddProduct';
import SellerEditProductPage from './pages/seller/EditProduct';
import SellerOrdersPage from './pages/seller/Orders';
import SellerOrderDetailsPage from './pages/seller/OrderDetails';
import SellerInventoryPage from './pages/seller/Inventory';
import SellerAnalyticsPage from './pages/seller/Analytics';
import SellerProfilePage from './pages/seller/Profile';
import SellerSettingsPage from './pages/seller/Settings';
import SellerStorePage from './pages/seller/Store';
import SellerDeliveriesPage from './pages/seller/Deliveries';

// Common Pages
import NotFoundPage from './pages/common/NotFoundPage';

/**
 * App Router - Role-based routing with guards
 * Separates buyer and seller flows completely
 */
export default function AppRouter() {
  return (
    <Switch>
      {/* Auth Route with Auto Redirect */}
      <Route path="/auth">
        <PublicRoute>
          <AuthRedirect />
          <AuthPage />
        </PublicRoute>
      </Route>

      {/* Buyer Routes - Protected */}
      <Route path="/">
        <PublicRoute>
          <HomePage />
        </PublicRoute>
      </Route>
      <Route path="/products">
        <PublicRoute>
          <ProductsPage />
        </PublicRoute>
      </Route>
      <Route path="/products/:id">
        <PublicRoute>
          <ProductDetailsPage />
        </PublicRoute>
      </Route>
      <Route path="/cart">
        <PublicRoute>
          <CartPage />
        </PublicRoute>
      </Route>
      <Route path="/wishlist">
        <BuyerRoute>
          <WishlistPage />
        </BuyerRoute>
      </Route>
      <Route path="/checkout">
        <BuyerRoute>
          <CheckoutPage />
        </BuyerRoute>
      </Route>
      <Route path="/orders">
        <BuyerRoute>
          <OrdersPage />
        </BuyerRoute>
      </Route>
      <Route path="/orders/:id">
        <BuyerRoute>
          <OrderDetailsPage />
        </BuyerRoute>
      </Route>
      <Route path="/profile">
        <BuyerRoute>
          <ProfilePage />
        </BuyerRoute>
      </Route>

      {/* Seller Routes - Completely Separated */}
      <Route path="/seller/dashboard">
        <SellerRoute requireApproval={false}>
          <SellerDashboardPage />
        </SellerRoute>
      </Route>
      <Route path="/seller/store">
        <SellerRoute>
          <SellerStorePage />
        </SellerRoute>
      </Route>
      <Route path="/seller/products">
        <SellerRoute>
          <SellerProductsPage />
        </SellerRoute>
      </Route>
      <Route path="/seller/products/add">
        <SellerRoute>
          <SellerAddProductPage />
        </SellerRoute>
      </Route>
      <Route path="/seller/products/edit/:id">
        <SellerRoute>
          <SellerEditProductPage />
        </SellerRoute>
      </Route>
      <Route path="/seller/orders">
        <SellerRoute>
          <SellerOrdersPage />
        </SellerRoute>
      </Route>
      <Route path="/seller/orders/:id">
        <SellerRoute>
          <SellerOrderDetailsPage />
        </SellerRoute>
      </Route>
      <Route path="/seller/deliveries">
        <SellerRoute>
          <SellerDeliveriesPage />
        </SellerRoute>
      </Route>
      <Route path="/seller/inventory">
        <SellerRoute>
          <SellerInventoryPage />
        </SellerRoute>
      </Route>
      <Route path="/seller/analytics">
        <SellerRoute>
          <SellerAnalyticsPage />
        </SellerRoute>
      </Route>
      <Route path="/seller/profile">
        <SellerRoute requireApproval={false}>
          <SellerProfilePage />
        </SellerRoute>
      </Route>
      <Route path="/seller/settings">
        <SellerRoute requireApproval={false}>
          <SellerSettingsPage />
        </SellerRoute>
      </Route>

      {/* 404 */}
      <Route component={NotFoundPage} />
    </Switch>
  );
}
