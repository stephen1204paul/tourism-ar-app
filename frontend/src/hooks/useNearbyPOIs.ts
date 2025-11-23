import { useState, useEffect, useCallback } from 'react';
import { useQuery, ApolloError } from '@apollo/client';
import { GET_NEARBY_POIS } from '../services/api/queries';
import { locationService, Location, POI } from '../services/location/LocationService';

interface NearbyPOIInput {
  latitude: number;
  longitude: number;
  radius: number;
}

interface NearbyPOIsData {
  nearbyPOIs: POI[];
}

interface NearbyPOIsVariables {
  input: NearbyPOIInput;
}

interface UseNearbyPOIsOptions {
  radius?: number;
  skip?: boolean;
}

interface UseNearbyPOIsResult {
  pois: POI[];
  loading: boolean;
  error: ApolloError | Error | undefined;
  refetch: () => void;
}

const DEFAULT_RADIUS = 1000; // 1km default radius

export function useNearbyPOIs(options: UseNearbyPOIsOptions = {}): UseNearbyPOIsResult {
  const { radius = DEFAULT_RADIUS, skip = false } = options;
  const [location, setLocation] = useState<Location | undefined>(undefined);
  const [locationError, setLocationError] = useState<Error | undefined>(undefined);

  // Get initial location and subscribe to updates
  useEffect(() => {
    let unsubscribeLocation: (() => void) | undefined;
    let unsubscribeError: (() => void) | undefined;

    const initLocation = async () => {
      try {
        // Get current position first
        const currentLocation = await locationService.getCurrentPosition();
        setLocation(currentLocation);

        // Start tracking for updates
        locationService.startTracking();

        // Subscribe to location updates
        unsubscribeLocation = locationService.onLocationUpdate((newLocation) => {
          setLocation(newLocation);
        });

        // Subscribe to errors
        unsubscribeError = locationService.onError((error) => {
          setLocationError(new Error(error.message));
        });
      } catch (error) {
        setLocationError(error instanceof Error ? error : new Error('Failed to get location'));
      }
    };

    if (!skip) {
      initLocation();
    }

    return () => {
      unsubscribeLocation?.();
      unsubscribeError?.();
      locationService.stopTracking();
    };
  }, [skip]);

  // Query nearby POIs when we have location
  const { data, loading: queryLoading, error: queryError, refetch: apolloRefetch } = useQuery<
    NearbyPOIsData,
    NearbyPOIsVariables
  >(GET_NEARBY_POIS, {
    variables: {
      input: {
        latitude: location?.latitude || 0,
        longitude: location?.longitude || 0,
        radius,
      },
    },
    skip: skip || !location,
    fetchPolicy: 'cache-and-network',
  });

  // Refetch function that also refreshes location
  const refetch = useCallback(async () => {
    try {
      const newLocation = await locationService.getCurrentPosition();
      setLocation(newLocation);
      await apolloRefetch({
        input: {
          latitude: newLocation.latitude,
          longitude: newLocation.longitude,
          radius,
        },
      });
    } catch (error) {
      console.error('Error refetching nearby POIs:', error);
    }
  }, [apolloRefetch, radius]);

  // Enrich POIs with distance and bearing from current location
  const enrichedPOIs = location && data?.nearbyPOIs
    ? locationService.enrichPOIsWithLocation(data.nearbyPOIs)
    : data?.nearbyPOIs || [];

  return {
    pois: enrichedPOIs,
    loading: queryLoading || (!location && !locationError && !skip),
    error: locationError || queryError,
    refetch,
  };
}

export default useNearbyPOIs;
