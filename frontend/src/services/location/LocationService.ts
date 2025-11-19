export interface Location {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy: number;
  heading?: number;
  speed?: number;
}

export interface POI {
  id: string;
  name: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
    altitude?: number;
    city?: string;
    country?: string;
  };
  category: string;
  tags: string[];
  distance?: number;
  bearing?: number;
}

export class LocationService {
  private watchId?: number;
  private currentLocation?: Location;
  private locationCallbacks: ((location: Location) => void)[] = [];
  private errorCallbacks: ((error: GeolocationPositionError) => void)[] = [];

  /**
   * Start tracking the user's location
   */
  public startTracking(): void {
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported by this browser');
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        this.currentLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          altitude: position.coords.altitude || undefined,
          accuracy: position.coords.accuracy,
          heading: position.coords.heading || undefined,
          speed: position.coords.speed || undefined,
        };

        // Notify all subscribers
        this.locationCallbacks.forEach((callback) => {
          callback(this.currentLocation!);
        });
      },
      (error) => {
        console.error('Location error:', error);
        this.errorCallbacks.forEach((callback) => {
          callback(error);
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }

  /**
   * Stop tracking the user's location
   */
  public stopTracking(): void {
    if (this.watchId !== undefined) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = undefined;
    }
  }

  /**
   * Get the current location once
   */
  public getCurrentPosition(): Promise<Location> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            altitude: position.coords.altitude || undefined,
            accuracy: position.coords.accuracy,
            heading: position.coords.heading || undefined,
            speed: position.coords.speed || undefined,
          };
          this.currentLocation = location;
          resolve(location);
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }

  /**
   * Subscribe to location updates
   */
  public onLocationUpdate(callback: (location: Location) => void): () => void {
    this.locationCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.locationCallbacks.indexOf(callback);
      if (index > -1) {
        this.locationCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Subscribe to location errors
   */
  public onError(callback: (error: GeolocationPositionError) => void): () => void {
    this.errorCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.errorCallbacks.indexOf(callback);
      if (index > -1) {
        this.errorCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  public calculateDistance(point1: Location, point2: Location): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (point1.latitude * Math.PI) / 180;
    const φ2 = (point2.latitude * Math.PI) / 180;
    const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
    const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  /**
   * Calculate bearing from one point to another
   */
  public getBearing(from: Location, to: Location): number {
    const φ1 = (from.latitude * Math.PI) / 180;
    const φ2 = (to.latitude * Math.PI) / 180;
    const Δλ = ((to.longitude - from.longitude) * Math.PI) / 180;

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x =
      Math.cos(φ1) * Math.sin(φ2) -
      Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

    const θ = Math.atan2(y, x);

    return ((θ * 180) / Math.PI + 360) % 360; // Bearing in degrees
  }

  /**
   * Get the current location
   */
  public getLocation(): Location | undefined {
    return this.currentLocation;
  }

  /**
   * Add distance and bearing to POIs based on current location
   */
  public enrichPOIsWithLocation(pois: POI[]): POI[] {
    if (!this.currentLocation) {
      return pois;
    }

    return pois.map((poi) => ({
      ...poi,
      distance: this.calculateDistance(this.currentLocation!, poi.location),
      bearing: this.getBearing(this.currentLocation!, poi.location),
    })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }

  /**
   * Filter POIs within a certain radius
   */
  public filterPOIsByRadius(pois: POI[], radius: number): POI[] {
    if (!this.currentLocation) {
      return pois;
    }

    return pois.filter((poi) => {
      const distance = this.calculateDistance(this.currentLocation!, poi.location);
      return distance <= radius;
    });
  }
}

// Export singleton instance
export const locationService = new LocationService();
export default locationService;
