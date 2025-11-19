import React from 'react';
import styled from 'styled-components';

interface POI {
  id: string;
  name: string;
  description: string;
  category: string;
  distance?: number;
  location: {
    latitude: number;
    longitude: number;
    city?: string;
    country?: string;
  };
}

interface POICardProps {
  poi: POI;
  onClick?: () => void;
}

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin: 12px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
`;

const Distance = styled.div`
  background: #007bff;
  color: white;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
`;

const Description = styled.p`
  margin: 8px 0;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
`;

const Category = styled.span`
  display: inline-block;
  background: #f0f0f0;
  color: #666;
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 12px;
  text-transform: capitalize;
`;

const Location = styled.span`
  font-size: 12px;
  color: #999;
`;

export const POICard: React.FC<POICardProps> = ({ poi, onClick }) => {
  const formatDistance = (meters?: number): string => {
    if (!meters) return 'Unknown';
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  return (
    <Card onClick={onClick}>
      <Header>
        <Title>{poi.name}</Title>
        {poi.distance !== undefined && (
          <Distance>{formatDistance(poi.distance)}</Distance>
        )}
      </Header>
      <Description>{poi.description}</Description>
      <Footer>
        <Category>{poi.category}</Category>
        <Location>
          {poi.location.city && poi.location.country
            ? `${poi.location.city}, ${poi.location.country}`
            : 'Location unavailable'}
        </Location>
      </Footer>
    </Card>
  );
};

export default POICard;
