/**
 * Centralized Query Key Factory
 * Ensures consistent query key structures across all components and hooks.
 * Every parameter that alters the returned server dataset is part of the query key.
 */
export const queryKeys = {
  products: {
    all: ['products'],
    paginated: (filters) => ['products', 'paginated', filters],
    infinite: (filters) => ['products', 'infinite', filters],
    search: (filters) => ['products', 'search', filters],
    detail: (id) => ['products', 'detail', id],
    ratings: (productId) => ['products', 'ratings', productId],
    related: (category) => ['products', 'related', category],
    counts: ['products', 'counts'],
  },
  categories: {
    all: ['categories', 'all'],
  },
  orders: {
    all: ['orders'],
    paginated: (filters) => ['orders', 'paginated', filters],
    detail: (id) => ['orders', 'detail', id],
    counts: ['orders', 'counts'],
    recent: ['orders', 'recent'],
    user: (uid, email) => ['orders', 'user', uid, email],
  },
  users: {
    all: ['users'],
    paginated: (filters) => ['users', 'paginated', filters],
    counts: ['users', 'counts'],
  },
  coupons: {
    all: ['coupons', 'all'],
  },
  reviews: {
    all: ['reviews', 'all'],
    paginated: (filters) => ['reviews', 'paginated', filters],
  },
  configure: {
    site: ['configure', 'site'],
    banners: ['configure', 'banners'],
    collections: ['configure', 'collections'],
  },
  dashboard: {
    stats: ['dashboard', 'stats'],
  },
};

export default queryKeys;
