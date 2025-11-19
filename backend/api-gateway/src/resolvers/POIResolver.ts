import { Resolver, Query, Mutation, Arg, ID } from 'type-graphql';
import { POI, POIInput, NearbyPOIInput } from '../types/POI';

// Mock data for development
const mockPOIs: POI[] = [
  {
    id: '1',
    name: 'Statue of Liberty',
    description: 'A colossal neoclassical sculpture on Liberty Island',
    location: {
      latitude: 40.6892,
      longitude: -74.0445,
      address: 'Liberty Island',
      city: 'New York',
      country: 'USA',
    },
    category: 'monument',
    tags: ['landmark', 'historical', 'statue'],
    arContent: {
      id: '1',
      modelUrl: '/models/statue-of-liberty.glb',
      markerPattern: '/markers/liberty.patt',
      scale: 1.0,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Eiffel Tower',
    description: 'A wrought-iron lattice tower on the Champ de Mars',
    location: {
      latitude: 48.8584,
      longitude: 2.2945,
      address: 'Champ de Mars',
      city: 'Paris',
      country: 'France',
    },
    category: 'monument',
    tags: ['landmark', 'historical', 'tower'],
    arContent: {
      id: '2',
      modelUrl: '/models/eiffel-tower.glb',
      markerPattern: '/markers/eiffel.patt',
      scale: 1.0,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

@Resolver(POI)
export class POIResolver {
  @Query(() => POI, { nullable: true })
  async poi(@Arg('id', () => ID) id: string): Promise<POI | undefined> {
    return mockPOIs.find((poi) => poi.id === id);
  }

  @Query(() => [POI])
  async allPOIs(): Promise<POI[]> {
    return mockPOIs;
  }

  @Query(() => [POI])
  async nearbyPOIs(@Arg('input') input: NearbyPOIInput): Promise<POI[]> {
    // Calculate distance using Haversine formula
    const calculateDistance = (
      lat1: number,
      lon1: number,
      lat2: number,
      lon2: number
    ): number => {
      const R = 6371e3; // Earth radius in meters
      const φ1 = (lat1 * Math.PI) / 180;
      const φ2 = (lat2 * Math.PI) / 180;
      const Δφ = ((lat2 - lat1) * Math.PI) / 180;
      const Δλ = ((lon2 - lon1) * Math.PI) / 180;

      const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      return R * c; // Distance in meters
    };

    // Filter POIs by radius and add distance
    const poisWithDistance = mockPOIs
      .map((poi) => ({
        ...poi,
        distance: calculateDistance(
          input.latitude,
          input.longitude,
          poi.location.latitude,
          poi.location.longitude
        ),
      }))
      .filter((poi) => poi.distance <= (input.radius || 500))
      .sort((a, b) => (a.distance || 0) - (b.distance || 0));

    return poisWithDistance;
  }

  @Mutation(() => POI)
  async createPOI(@Arg('input') input: POIInput): Promise<POI> {
    const newPOI: POI = {
      id: String(mockPOIs.length + 1),
      name: input.name,
      description: input.description,
      location: {
        latitude: input.latitude,
        longitude: input.longitude,
      },
      category: input.category || 'general',
      tags: input.tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockPOIs.push(newPOI);
    return newPOI;
  }
}
