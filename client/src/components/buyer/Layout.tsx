import { ReactNode } from 'react';
import Navigation from './navigation/Navigation';
import CategoryNav from './navigation/CategoryNav';
import Footer from './navigation/Footer';

/**
 * Layout Component - Wraps pages with navigation and footer
 */
interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />
      <CategoryNav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
