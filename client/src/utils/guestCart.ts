/**
 * Guest Cart Utilities
 * Manages cart in localStorage for unauthenticated users
 */

export interface GuestCartItem {
  productId: number;
  variantId?: number | null;
  quantity: number;
  addedAt: string;
}

export interface GuestCart {
  items: GuestCartItem[];
  updatedAt: string;
}

const GUEST_CART_KEY = 'guest_cart';

export const guestCartUtils = {
  /**
   * Get guest cart from localStorage
   */
  getCart: (): GuestCart => {
    try {
      const cartData = localStorage.getItem(GUEST_CART_KEY);
      if (!cartData) {
        return { items: [], updatedAt: new Date().toISOString() };
      }
      return JSON.parse(cartData);
    } catch (error) {
      console.error('Failed to get guest cart:', error);
      return { items: [], updatedAt: new Date().toISOString() };
    }
  },

  /**
   * Save guest cart to localStorage
   */
  saveCart: (cart: GuestCart): void => {
    try {
      cart.updatedAt = new Date().toISOString();
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
      // Dispatch custom event for same-tab updates
      window.dispatchEvent(new Event('guestCartUpdated'));
    } catch (error) {
      console.error('Failed to save guest cart:', error);
    }
  },

  /**
   * Add item to guest cart (handles variants)
   */
  addItem: (productId: number, quantity: number, variantId?: number | null): void => {
    const cart = guestCartUtils.getCart();

    // Check if item already exists (same product + same variant)
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId === productId && item.variantId === variantId
    );

    if (existingItemIndex >= 0) {
      // Update quantity of existing item
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        productId,
        variantId: variantId || null,
        quantity,
        addedAt: new Date().toISOString(),
      });
    }

    guestCartUtils.saveCart(cart);
  },

  /**
   * Update item quantity in guest cart
   */
  updateItem: (productId: number, quantity: number, variantId?: number | null): void => {
    const cart = guestCartUtils.getCart();
    const itemIndex = cart.items.findIndex(
      (item) => item.productId === productId && item.variantId === variantId
    );

    if (itemIndex >= 0) {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = quantity;
      }
      guestCartUtils.saveCart(cart);
    }
  },

  /**
   * Remove item from guest cart
   */
  removeItem: (productId: number, variantId?: number | null): void => {
    const cart = guestCartUtils.getCart();
    cart.items = cart.items.filter(
      (item) => !(item.productId === productId && item.variantId === variantId)
    );
    guestCartUtils.saveCart(cart);
  },

  /**
   * Check if item is in cart
   */
  isInCart: (productId: number, variantId?: number | null): boolean => {
    const cart = guestCartUtils.getCart();
    return cart.items.some((item) => item.productId === productId && item.variantId === variantId);
  },

  /**
   * Get item quantity
   */
  getItemQuantity: (productId: number, variantId?: number | null): number => {
    const cart = guestCartUtils.getCart();
    const item = cart.items.find(
      (item) => item.productId === productId && item.variantId === variantId
    );
    return item?.quantity || 0;
  },

  /**
   * Clear entire guest cart
   */
  clearCart: (): void => {
    try {
      localStorage.removeItem(GUEST_CART_KEY);
      // Dispatch custom event for same-tab updates
      window.dispatchEvent(new Event('guestCartUpdated'));
    } catch (error) {
      console.error('Failed to clear guest cart:', error);
    }
  },

  /**
   * Get cart count
   */
  getCartCount: (): number => {
    const cart = guestCartUtils.getCart();
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  },
};
