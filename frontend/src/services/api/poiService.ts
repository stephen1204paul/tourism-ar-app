import { apolloClient } from './apolloClient';
import { GET_NEARBY_POIS, GET_POI, CREATE_POI, GET_ALL_POIS } from './queries';
import { POI, POIInput, ApiResponse } from './types';

export async function getNearbyPOIs(
  lat: number,
  lng: number,
  radius: number
): Promise<ApiResponse<POI[]>> {
  try {
    const { data } = await apolloClient.query({
      query: GET_NEARBY_POIS,
      variables: {
        input: {
          latitude: lat,
          longitude: lng,
          radius,
        },
      },
      fetchPolicy: 'network-only',
    });
    return { data: data.nearbyPOIs, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch nearby POIs',
    };
  }
}

export async function getPOIById(id: string): Promise<ApiResponse<POI>> {
  try {
    const { data } = await apolloClient.query({
      query: GET_POI,
      variables: { id },
    });
    return { data: data.poi, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch POI',
    };
  }
}

export async function createPOI(input: POIInput): Promise<ApiResponse<POI>> {
  try {
    const { data } = await apolloClient.mutate({
      mutation: CREATE_POI,
      variables: { input },
    });
    return { data: data.createPOI, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to create POI',
    };
  }
}

export async function searchPOIs(query: string): Promise<ApiResponse<POI[]>> {
  try {
    const { data } = await apolloClient.query({
      query: GET_ALL_POIS,
      fetchPolicy: 'network-only',
    });

    // Client-side filtering until search query is added to backend
    const filtered = data.allPOIs.filter((poi: POI) =>
      poi.name.toLowerCase().includes(query.toLowerCase()) ||
      poi.description.toLowerCase().includes(query.toLowerCase()) ||
      poi.category.toLowerCase().includes(query.toLowerCase()) ||
      poi.tags.some((tag: string) => tag.toLowerCase().includes(query.toLowerCase()))
    );

    return { data: filtered, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to search POIs',
    };
  }
}
