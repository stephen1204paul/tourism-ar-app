import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import styled from 'styled-components';
import ARViewer from '../components/ar/ARViewer';
import POICard from '../components/ui/POICard';
import { GET_NEARBY_POIS } from '../services/api/queries';
import { useLocation } from '../hooks/useLocation';
import { POI } from '../services/location/LocationService';

const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
`;

const Sidebar = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 0;
  right: ${(props) => (props.isOpen ? '0' : '-400px')};
  width: 400px;
  height: 100%;
  background: white;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
  transition: right 0.3s ease;
  z-index: 1000;
  overflow-y: auto;
  padding: 20px;

  @media (max-width: 768px) {
    width: 100%;
    right: ${(props) => (props.isOpen ? '0' : '-100%')};
  }
`;

const ToggleButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1001;
  background: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  font-size: 24px;

  &:hover {
    background: #f0f0f0;
  }
`;

const Title = styled.h1`
  margin: 0 0 20px 0;
  font-size: 24px;
  font-weight: 600;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 20px;
  color: #666;
`;

const ErrorMessage = styled.div`
  background: #fee;
  color: #c00;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
`;

const LocationInfo = styled.div`
  background: #f0f0f0;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
`;

export const ARExperiencePage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
  const { location, error: locationError, isTracking } = useLocation(true);

  // Query nearby POIs when location is available
  const { data, loading, error: queryError } = useQuery(GET_NEARBY_POIS, {
    variables: {
      input: {
        latitude: location?.latitude || 0,
        longitude: location?.longitude || 0,
        radius: 5000, // 5km radius
      },
    },
    skip: !location, // Skip query if location is not available
    pollInterval: 30000, // Refresh every 30 seconds
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handlePOIClick = (poi: POI) => {
    setSelectedPOI(poi);
    // Could navigate to AR view of this specific POI
  };

  return (
    <Container>
      {/* AR Viewer */}
      <ARViewer
        markerUrl={selectedPOI?.arContent?.markerPattern || 'preset:hiro'}
        modelUrl={selectedPOI?.arContent?.modelUrl}
        scale={selectedPOI?.arContent?.scale || 1}
        onMarkerFound={() => console.log('Marker detected!')}
        onMarkerLost={() => console.log('Marker lost!')}
      />

      {/* Toggle Button */}
      <ToggleButton onClick={toggleSidebar}>
        {isSidebarOpen ? '→' : '←'}
      </ToggleButton>

      {/* Sidebar with POI List */}
      <Sidebar isOpen={isSidebarOpen}>
        <Title>Nearby Points of Interest</Title>

        {/* Location Status */}
        {locationError && (
          <ErrorMessage>
            Location error: {locationError.message}. Please enable location
            services.
          </ErrorMessage>
        )}

        {location && (
          <LocationInfo>
            📍 Your location: {location.latitude.toFixed(4)},{' '}
            {location.longitude.toFixed(4)}
            <br />
            Accuracy: ±{Math.round(location.accuracy)}m
            {isTracking && <span> • Tracking active</span>}
          </LocationInfo>
        )}

        {/* Query Status */}
        {loading && <LoadingMessage>Loading nearby POIs...</LoadingMessage>}

        {queryError && (
          <ErrorMessage>
            Failed to load POIs: {queryError.message}
          </ErrorMessage>
        )}

        {/* POI List */}
        {data?.nearbyPOIs && data.nearbyPOIs.length === 0 && (
          <LoadingMessage>
            No POIs found within 5km of your location.
          </LoadingMessage>
        )}

        {data?.nearbyPOIs?.map((poi: POI) => (
          <POICard
            key={poi.id}
            poi={poi}
            onClick={() => handlePOIClick(poi)}
          />
        ))}
      </Sidebar>
    </Container>
  );
};

export default ARExperiencePage;
