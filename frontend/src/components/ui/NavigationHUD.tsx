import React from 'react';
import styled from 'styled-components';

interface NavigationHUDProps {
  heading: number; // 0-360 degrees
  targetBearing?: number; // Direction to target in degrees
  distance?: number; // Distance in meters
  targetName?: string;
  accuracy?: number; // GPS accuracy in meters
}

const HUDContainer = styled.div`
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 16px 24px;
  color: white;
  z-index: 100;
  min-width: 200px;
`;

const CompassWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 12px;
`;

const CompassRing = styled.div`
  position: relative;
  width: 80px;
  height: 80px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CompassNeedle = styled.div<{ $rotation: number }>`
  position: absolute;
  width: 4px;
  height: 30px;
  background: linear-gradient(to top, #007bff 50%, #ff4444 50%);
  border-radius: 2px;
  transform: rotate(${({ $rotation }) => $rotation}deg);
  transform-origin: center bottom;
  bottom: 50%;
`;

const TargetIndicator = styled.div<{ $rotation: number }>`
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%) rotate(${({ $rotation }) => $rotation}deg);
  transform-origin: center 48px;
  color: #00ff88;
  font-size: 16px;
`;

const DirectionLabel = styled.div`
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 2px;
`;

const CardinalPoints = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  font-size: 10px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
`;

const CardinalPoint = styled.span<{ $position: 'N' | 'S' | 'E' | 'W' }>`
  position: absolute;
  ${({ $position }) => {
    switch ($position) {
      case 'N':
        return 'top: 4px; left: 50%; transform: translateX(-50%);';
      case 'S':
        return 'bottom: 4px; left: 50%; transform: translateX(-50%);';
      case 'E':
        return 'right: 4px; top: 50%; transform: translateY(-50%);';
      case 'W':
        return 'left: 4px; top: 50%; transform: translateY(-50%);';
    }
  }}
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
`;

const InfoLabel = styled.span`
  color: rgba(255, 255, 255, 0.6);
`;

const InfoValue = styled.span`
  font-weight: 600;
  color: #00ff88;
`;

const TargetName = styled.div`
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  padding: 8px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  margin-top: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const NavigationHUD: React.FC<NavigationHUDProps> = ({
  heading,
  targetBearing,
  distance,
  targetName,
  accuracy,
}) => {
  const getCardinalDirection = (degrees: number): string => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  const formatDistance = (meters?: number): string => {
    if (!meters) return '--';
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const relativeTargetBearing = targetBearing !== undefined
    ? (targetBearing - heading + 360) % 360
    : undefined;

  return (
    <HUDContainer>
      <CompassWrapper>
        <CompassRing>
          <CardinalPoints>
            <CardinalPoint $position="N">N</CardinalPoint>
            <CardinalPoint $position="S">S</CardinalPoint>
            <CardinalPoint $position="E">E</CardinalPoint>
            <CardinalPoint $position="W">W</CardinalPoint>
          </CardinalPoints>
          <CompassNeedle $rotation={-heading} />
          {relativeTargetBearing !== undefined && (
            <TargetIndicator $rotation={relativeTargetBearing}>
              ▼
            </TargetIndicator>
          )}
        </CompassRing>
        <DirectionLabel>{getCardinalDirection(heading)}</DirectionLabel>
      </CompassWrapper>

      <InfoSection>
        <InfoRow>
          <InfoLabel>Heading</InfoLabel>
          <InfoValue>{Math.round(heading)}°</InfoValue>
        </InfoRow>
        {distance !== undefined && (
          <InfoRow>
            <InfoLabel>Distance</InfoLabel>
            <InfoValue>{formatDistance(distance)}</InfoValue>
          </InfoRow>
        )}
        {accuracy !== undefined && (
          <InfoRow>
            <InfoLabel>Accuracy</InfoLabel>
            <InfoValue>±{Math.round(accuracy)}m</InfoValue>
          </InfoRow>
        )}
      </InfoSection>

      {targetName && <TargetName>{targetName}</TargetName>}
    </HUDContainer>
  );
};

export default NavigationHUD;
