import 'reflect-metadata';
import { POIResolver } from './POIResolver';
import { NearbyPOIInput, POIInput } from '../types/POI';

describe('POIResolver', () => {
  let resolver: POIResolver;

  beforeEach(() => {
    resolver = new POIResolver();
  });

  describe('poi query', () => {
    it('should return POI by id', async () => {
      const result = await resolver.poi('1');

      expect(result).toBeDefined();
      expect(result?.id).toBe('1');
      expect(result?.name).toBe('Statue of Liberty');
      expect(result?.location.city).toBe('New York');
    });

    it('should return POI with all fields populated', async () => {
      const result = await resolver.poi('1');

      expect(result).toMatchObject({
        id: '1',
        name: 'Statue of Liberty',
        description: expect.any(String),
        location: {
          latitude: 40.6892,
          longitude: -74.0445,
          city: 'New York',
          country: 'USA',
        },
        category: 'monument',
        tags: expect.arrayContaining(['landmark', 'historical']),
      });
    });

    it('should return undefined for non-existent id', async () => {
      const result = await resolver.poi('999');

      expect(result).toBeUndefined();
    });

    it('should return Eiffel Tower for id 2', async () => {
      const result = await resolver.poi('2');

      expect(result).toBeDefined();
      expect(result?.name).toBe('Eiffel Tower');
      expect(result?.location.city).toBe('Paris');
    });
  });

  describe('nearbyPOIs query', () => {
    it('should return POIs within radius', async () => {
      const input: NearbyPOIInput = {
        latitude: 40.6892,
        longitude: -74.0445,
        radius: 1000, // 1km
      };

      const result = await resolver.nearbyPOIs(input);

      // Should find Statue of Liberty (exact location)
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].name).toBe('Statue of Liberty');
    });

    it('should return empty array when no POIs in radius', async () => {
      const input: NearbyPOIInput = {
        latitude: 0,
        longitude: 0,
        radius: 100, // Very small radius in middle of ocean
      };

      const result = await resolver.nearbyPOIs(input);

      expect(result).toEqual([]);
    });

    it('should use default radius of 500m when not specified', async () => {
      const input: NearbyPOIInput = {
        latitude: 40.6892,
        longitude: -74.0445,
      };

      const result = await resolver.nearbyPOIs(input);

      // Should still find the Statue of Liberty at exact location
      expect(result.length).toBeGreaterThan(0);
    });

    it('should sort results by distance', async () => {
      const input: NearbyPOIInput = {
        latitude: 40.6892,
        longitude: -74.0445,
        radius: 10000000, // Large radius to include multiple POIs
      };

      const result = await resolver.nearbyPOIs(input);

      // Verify sorted by distance
      for (let i = 1; i < result.length; i++) {
        expect(result[i].distance).toBeGreaterThanOrEqual(result[i - 1].distance || 0);
      }
    });

    it('should include distance in returned POIs', async () => {
      const input: NearbyPOIInput = {
        latitude: 40.6892,
        longitude: -74.0445,
        radius: 10000000,
      };

      const result = await resolver.nearbyPOIs(input);

      expect(result.length).toBeGreaterThan(0);
      result.forEach((poi) => {
        expect(poi.distance).toBeDefined();
        expect(typeof poi.distance).toBe('number');
      });
    });

    it('should calculate correct distance for known coordinates', async () => {
      // Query from NYC to find Statue of Liberty
      const input: NearbyPOIInput = {
        latitude: 40.7128, // Manhattan
        longitude: -74.006,
        radius: 10000,
      };

      const result = await resolver.nearbyPOIs(input);
      const statueOfLiberty = result.find((poi) => poi.name === 'Statue of Liberty');

      if (statueOfLiberty) {
        // Distance from Manhattan to Statue of Liberty is ~5km
        expect(statueOfLiberty.distance).toBeGreaterThan(4000);
        expect(statueOfLiberty.distance).toBeLessThan(6000);
      }
    });
  });

  describe('createPOI mutation', () => {
    it('should create a new POI with required fields', async () => {
      const input: POIInput = {
        name: 'Test POI',
        description: 'A test point of interest',
        latitude: 51.5074,
        longitude: -0.1278,
      };

      const result = await resolver.createPOI(input);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBe('Test POI');
      expect(result.description).toBe('A test point of interest');
      expect(result.location.latitude).toBe(51.5074);
      expect(result.location.longitude).toBe(-0.1278);
    });

    it('should set default category when not provided', async () => {
      const input: POIInput = {
        name: 'No Category POI',
        description: 'POI without category',
        latitude: 0,
        longitude: 0,
      };

      const result = await resolver.createPOI(input);

      expect(result.category).toBe('general');
    });

    it('should use provided category', async () => {
      const input: POIInput = {
        name: 'Museum POI',
        description: 'A museum',
        latitude: 48.8606,
        longitude: 2.3376,
        category: 'museum',
      };

      const result = await resolver.createPOI(input);

      expect(result.category).toBe('museum');
    });

    it('should set empty tags array when not provided', async () => {
      const input: POIInput = {
        name: 'No Tags POI',
        description: 'POI without tags',
        latitude: 0,
        longitude: 0,
      };

      const result = await resolver.createPOI(input);

      expect(result.tags).toEqual([]);
    });

    it('should use provided tags', async () => {
      const input: POIInput = {
        name: 'Tagged POI',
        description: 'POI with tags',
        latitude: 35.6762,
        longitude: 139.6503,
        tags: ['temple', 'historical', 'tokyo'],
      };

      const result = await resolver.createPOI(input);

      expect(result.tags).toEqual(['temple', 'historical', 'tokyo']);
    });

    it('should set createdAt and updatedAt timestamps', async () => {
      const before = new Date();

      const input: POIInput = {
        name: 'Timestamped POI',
        description: 'Testing timestamps',
        latitude: 0,
        longitude: 0,
      };

      const result = await resolver.createPOI(input);
      const after = new Date();

      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
      expect(result.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(result.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should generate unique IDs for new POIs', async () => {
      const input1: POIInput = {
        name: 'POI 1',
        description: 'First POI',
        latitude: 0,
        longitude: 0,
      };

      const input2: POIInput = {
        name: 'POI 2',
        description: 'Second POI',
        latitude: 1,
        longitude: 1,
      };

      const result1 = await resolver.createPOI(input1);
      const result2 = await resolver.createPOI(input2);

      expect(result1.id).not.toBe(result2.id);
    });
  });

  describe('allPOIs query', () => {
    it('should return all POIs', async () => {
      const result = await resolver.allPOIs();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(2);
    });

    it('should include both mock POIs', async () => {
      const result = await resolver.allPOIs();

      const names = result.map((poi) => poi.name);
      expect(names).toContain('Statue of Liberty');
      expect(names).toContain('Eiffel Tower');
    });
  });
});
