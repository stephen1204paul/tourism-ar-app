import { LocationService, Location, POI } from './LocationService';

describe('LocationService', () => {
  let service: LocationService;

  beforeEach(() => {
    service = new LocationService();
  });

  describe('calculateDistance', () => {
    it('should calculate distance between New York and Los Angeles', () => {
      const newYork: Location = {
        latitude: 40.7128,
        longitude: -74.006,
        accuracy: 10,
      };
      const losAngeles: Location = {
        latitude: 34.0522,
        longitude: -118.2437,
        accuracy: 10,
      };

      const distance = service.calculateDistance(newYork, losAngeles);

      // Expected distance is approximately 3944 km
      expect(distance).toBeGreaterThan(3900000);
      expect(distance).toBeLessThan(4000000);
    });

    it('should calculate distance between two close points', () => {
      const point1: Location = {
        latitude: 40.7128,
        longitude: -74.006,
        accuracy: 10,
      };
      const point2: Location = {
        latitude: 40.7138,
        longitude: -74.006,
        accuracy: 10,
      };

      const distance = service.calculateDistance(point1, point2);

      // Should be approximately 111 meters (0.001 degrees latitude)
      expect(distance).toBeGreaterThan(100);
      expect(distance).toBeLessThan(120);
    });

    it('should return 0 for same point', () => {
      const point: Location = {
        latitude: 40.7128,
        longitude: -74.006,
        accuracy: 10,
      };

      const distance = service.calculateDistance(point, point);

      expect(distance).toBe(0);
    });

    it('should calculate distance across prime meridian', () => {
      const london: Location = {
        latitude: 51.5074,
        longitude: -0.1278,
        accuracy: 10,
      };
      const paris: Location = {
        latitude: 48.8566,
        longitude: 2.3522,
        accuracy: 10,
      };

      const distance = service.calculateDistance(london, paris);

      // Expected distance is approximately 344 km
      expect(distance).toBeGreaterThan(340000);
      expect(distance).toBeLessThan(350000);
    });
  });

  describe('getBearing', () => {
    it('should return 0 degrees for due north', () => {
      const from: Location = {
        latitude: 40.0,
        longitude: -74.0,
        accuracy: 10,
      };
      const to: Location = {
        latitude: 41.0,
        longitude: -74.0,
        accuracy: 10,
      };

      const bearing = service.getBearing(from, to);

      expect(bearing).toBeCloseTo(0, 0);
    });

    it('should return 90 degrees for due east', () => {
      const from: Location = {
        latitude: 0,
        longitude: 0,
        accuracy: 10,
      };
      const to: Location = {
        latitude: 0,
        longitude: 1,
        accuracy: 10,
      };

      const bearing = service.getBearing(from, to);

      expect(bearing).toBeCloseTo(90, 0);
    });

    it('should return 180 degrees for due south', () => {
      const from: Location = {
        latitude: 41.0,
        longitude: -74.0,
        accuracy: 10,
      };
      const to: Location = {
        latitude: 40.0,
        longitude: -74.0,
        accuracy: 10,
      };

      const bearing = service.getBearing(from, to);

      expect(bearing).toBeCloseTo(180, 0);
    });

    it('should return 270 degrees for due west', () => {
      const from: Location = {
        latitude: 0,
        longitude: 1,
        accuracy: 10,
      };
      const to: Location = {
        latitude: 0,
        longitude: 0,
        accuracy: 10,
      };

      const bearing = service.getBearing(from, to);

      expect(bearing).toBeCloseTo(270, 0);
    });

    it('should calculate northeast bearing', () => {
      const from: Location = {
        latitude: 40.0,
        longitude: -74.0,
        accuracy: 10,
      };
      const to: Location = {
        latitude: 41.0,
        longitude: -73.0,
        accuracy: 10,
      };

      const bearing = service.getBearing(from, to);

      // Should be between 0 and 90
      expect(bearing).toBeGreaterThan(0);
      expect(bearing).toBeLessThan(90);
    });
  });

  describe('enrichPOIsWithLocation', () => {
    const mockPOIs: POI[] = [
      {
        id: '1',
        name: 'Far POI',
        description: 'A far away point',
        location: {
          latitude: 34.0522,
          longitude: -118.2437,
        },
        category: 'landmark',
        tags: ['test'],
      },
      {
        id: '2',
        name: 'Close POI',
        description: 'A nearby point',
        location: {
          latitude: 40.7138,
          longitude: -74.006,
        },
        category: 'landmark',
        tags: ['test'],
      },
    ];

    it('should return original POIs if no current location', () => {
      const result = service.enrichPOIsWithLocation(mockPOIs);

      expect(result).toEqual(mockPOIs);
      expect(result[0].distance).toBeUndefined();
      expect(result[0].bearing).toBeUndefined();
    });

    it('should add distance and bearing when location is set', () => {
      // Mock the geolocation API
      const mockGeolocation = {
        getCurrentPosition: jest.fn((success) => {
          success({
            coords: {
              latitude: 40.7128,
              longitude: -74.006,
              accuracy: 10,
              altitude: null,
              altitudeAccuracy: null,
              heading: null,
              speed: null,
            },
            timestamp: Date.now(),
          });
        }),
        watchPosition: jest.fn(),
        clearWatch: jest.fn(),
      };

      Object.defineProperty(global.navigator, 'geolocation', {
        value: mockGeolocation,
        configurable: true,
      });

      return service.getCurrentPosition().then(() => {
        const result = service.enrichPOIsWithLocation(mockPOIs);

        expect(result[0].distance).toBeDefined();
        expect(result[0].bearing).toBeDefined();
        expect(result[1].distance).toBeDefined();
        expect(result[1].bearing).toBeDefined();
      });
    });

    it('should sort POIs by distance (closest first)', () => {
      // Set current location manually via getCurrentPosition mock
      const mockGeolocation = {
        getCurrentPosition: jest.fn((success) => {
          success({
            coords: {
              latitude: 40.7128,
              longitude: -74.006,
              accuracy: 10,
              altitude: null,
              altitudeAccuracy: null,
              heading: null,
              speed: null,
            },
            timestamp: Date.now(),
          });
        }),
        watchPosition: jest.fn(),
        clearWatch: jest.fn(),
      };

      Object.defineProperty(global.navigator, 'geolocation', {
        value: mockGeolocation,
        configurable: true,
      });

      return service.getCurrentPosition().then(() => {
        const result = service.enrichPOIsWithLocation(mockPOIs);

        // Close POI should be first after sorting
        expect(result[0].name).toBe('Close POI');
        expect(result[1].name).toBe('Far POI');
        expect(result[0].distance!).toBeLessThan(result[1].distance!);
      });
    });

    it('should handle empty POI array', () => {
      const result = service.enrichPOIsWithLocation([]);

      expect(result).toEqual([]);
    });
  });

  describe('geolocation tracking', () => {
    let mockGeolocation: {
      getCurrentPosition: jest.Mock;
      watchPosition: jest.Mock;
      clearWatch: jest.Mock;
    };

    beforeEach(() => {
      mockGeolocation = {
        getCurrentPosition: jest.fn(),
        watchPosition: jest.fn(() => 123),
        clearWatch: jest.fn(),
      };

      Object.defineProperty(global.navigator, 'geolocation', {
        value: mockGeolocation,
        configurable: true,
      });
    });

    it('should throw error if geolocation is not supported', () => {
      Object.defineProperty(global.navigator, 'geolocation', {
        value: undefined,
        configurable: true,
      });

      expect(() => service.startTracking()).toThrow(
        'Geolocation is not supported by this browser'
      );
    });

    it('should start watching position', () => {
      service.startTracking();

      expect(mockGeolocation.watchPosition).toHaveBeenCalled();
    });

    it('should stop watching position', () => {
      service.startTracking();
      service.stopTracking();

      expect(mockGeolocation.clearWatch).toHaveBeenCalledWith(123);
    });
  });
});
