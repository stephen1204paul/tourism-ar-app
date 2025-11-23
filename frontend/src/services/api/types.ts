// Base types matching GraphQL schema

export interface Location {
  latitude: number;
  longitude: number;
  altitude?: number;
  address?: string;
  city?: string;
  country?: string;
}

export interface ARContent {
  id: string;
  modelUrl: string;
  markerPattern?: string;
  scale?: number;
  rotation?: number;
  metadata?: Record<string, unknown>;
}

export interface POI {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  location: Location;
  arContent?: ARContent;
  distance?: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Review {
  id: string;
  poiId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt?: string;
}

// Input types
export interface NearbyPOIInput {
  latitude: number;
  longitude: number;
  radius: number;
}

export interface POIInput {
  name: string;
  description: string;
  category: string;
  tags?: string[];
  location: {
    latitude: number;
    longitude: number;
    altitude?: number;
    address?: string;
    city?: string;
    country?: string;
  };
}

export interface RegisterInput {
  email: string;
  username: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

// Response types
export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}
