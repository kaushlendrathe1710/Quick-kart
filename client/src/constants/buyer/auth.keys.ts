/**
 * Auth Query Keys for TanStack Query
 * Used for caching and invalidating auth-related queries
 */
export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
} as const;
