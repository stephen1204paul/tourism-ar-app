// API Service Layer
export { apolloClient } from './apolloClient';

// Types
export * from './types';

// POI Service
export {
  getNearbyPOIs,
  getPOIById,
  createPOI,
  searchPOIs,
} from './poiService';

// Auth Service
export {
  login,
  register,
  logout,
  getToken,
  isAuthenticated,
} from './authService';

// Queries (for direct use with hooks)
export * from './queries';
