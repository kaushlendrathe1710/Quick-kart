/**
 * Profile Query Keys for TanStack Query
 * Used for caching and invalidating profile-related queries
 */
export const profileKeys = {
  all: ['profile'] as const,
  addresses: () => [...profileKeys.all, 'addresses'] as const,
  address: (id: number) => [...profileKeys.addresses(), id] as const,
  paymentMethods: () => [...profileKeys.all, 'payment-methods'] as const,
  paymentMethod: (id: number) => [...profileKeys.paymentMethods(), id] as const,
} as const;
