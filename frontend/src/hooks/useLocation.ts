import { useState, useEffect } from 'react';
import { Location, locationService } from '../services/location/LocationService';

export const useLocation = (autoStart: boolean = true) => {
  const [location, setLocation] = useState<Location | undefined>(undefined);
  const [error, setError] = useState<GeolocationPositionError | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    if (autoStart) {
      startTracking();
    }

    return () => {
      stopTracking();
    };
  }, [autoStart]);

  const startTracking = () => {
    try {
      locationService.startTracking();
      setIsTracking(true);

      // Subscribe to location updates
      const unsubscribeLocation = locationService.onLocationUpdate((loc) => {
        setLocation(loc);
        setError(null);
      });

      // Subscribe to errors
      const unsubscribeError = locationService.onError((err) => {
        setError(err);
      });

      // Cleanup function
      return () => {
        unsubscribeLocation();
        unsubscribeError();
      };
    } catch (err) {
      setError(err as GeolocationPositionError);
    }
  };

  const stopTracking = () => {
    locationService.stopTracking();
    setIsTracking(false);
  };

  const getCurrentPosition = async (): Promise<Location | null> => {
    try {
      const position = await locationService.getCurrentPosition();
      setLocation(position);
      setError(null);
      return position;
    } catch (err) {
      setError(err as GeolocationPositionError);
      return null;
    }
  };

  return {
    location,
    error,
    isTracking,
    startTracking,
    stopTracking,
    getCurrentPosition,
  };
};

export default useLocation;
