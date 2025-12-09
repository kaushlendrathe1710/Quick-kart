import { Link } from 'wouter';

/**
 * Footer Component - Site footer
 */
export default function Footer() {
  return (
    <footer className="mt-auto border-t bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* About */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Quick-kart</h3>
            <p className="text-sm text-gray-600">
              Your one-stop shop for all your needs. Quality products, fast delivery, great prices.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products">
                  <a className="text-gray-600 hover:text-primary">Products</a>
                </Link>
              </li>
              <li>
                <Link href="/orders">
                  <a className="text-gray-600 hover:text-primary">Orders</a>
                </Link>
              </li>
              <li>
                <Link href="/cart">
                  <a className="text-gray-600 hover:text-primary">Cart</a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-600 hover:text-primary">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Partner With Us */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Partner With Us</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/auth?role=seller">
                  <a className="text-gray-600 hover:text-primary">Become a Seller</a>
                </Link>
              </li>
              <li>
                <Link href="/auth?role=deliveryPartner">
                  <a className="text-gray-600 hover:text-primary">Become a Delivery Partner</a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-600 hover:text-primary">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary">
                  Shipping Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} Quick-kart. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
