import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Button, Loader } from '../components/ui';

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

const Container = styled.div`
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 100px;
`;

const Header = styled.header`
  background: white;
  padding: 16px 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 12px;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  color: #333;
`;

const HeaderTitle = styled.h1`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
`;

const MapPlaceholder = styled.div`
  width: 100%;
  height: 200px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  font-weight: 500;
`;

const Content = styled.div`
  padding: 20px;
`;

const Section = styled.section`
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  margin: 0 0 12px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
`;

const POIName = styled.h2`
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 700;
  color: #333;
`;

const CategoryBadge = styled.span`
  display: inline-block;
  background: #007bff;
  color: white;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
  margin-bottom: 16px;
`;

const Description = styled.p`
  margin: 0;
  font-size: 14px;
  color: #666;
  line-height: 1.6;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const InfoLabel = styled.span`
  font-size: 12px;
  color: #999;
  text-transform: uppercase;
  font-weight: 500;
`;

const InfoValue = styled.span`
  font-size: 14px;
  color: #333;
  font-weight: 500;
`;

const DistanceBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #e3f2fd;
  color: #1976d2;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 16px;
`;

const ReviewItem = styled.div`
  padding: 12px 0;
  border-bottom: 1px solid #eee;

  &:last-child {
    border-bottom: none;
  }
`;

const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const ReviewAuthor = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const ReviewRating = styled.span`
  font-size: 14px;
  color: #ffc107;
`;

const ReviewText = styled.p`
  margin: 0;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
`;

const FixedBottomBar = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 16px 20px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
`;

const LoaderContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #dc3545;
`;

const POIDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [poi, setPoi] = useState<POI | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulated POI data fetch - replace with actual API call
    const fetchPOI = async () => {
      try {
        setLoading(true);
        // Simulated delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Mock data - replace with actual API call
        const mockPOI: POI = {
          id: id || '1',
          name: 'Historic Landmark',
          description: 'This is a beautiful historic landmark with rich cultural significance. The site has been preserved for over 200 years and offers visitors a glimpse into the past. Guided tours are available daily, and the grounds feature beautiful gardens and architectural details.',
          category: 'historical',
          distance: 450,
          location: {
            latitude: 40.7128,
            longitude: -74.0060,
            city: 'New York',
            country: 'USA'
          }
        };

        setPoi(mockPOI);
      } catch (err) {
        setError('Failed to load POI details');
      } finally {
        setLoading(false);
      }
    };

    fetchPOI();
  }, [id]);

  const formatDistance = (meters?: number): string => {
    if (!meters) return 'Unknown';
    if (meters < 1000) {
      return `${Math.round(meters)}m away`;
    }
    return `${(meters / 1000).toFixed(1)}km away`;
  };

  const handleStartAR = () => {
    navigate(`/ar?poi=${id}`);
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <Container>
        <Header>
          <BackButton onClick={handleBack}>←</BackButton>
          <HeaderTitle>Loading...</HeaderTitle>
        </Header>
        <LoaderContainer>
          <Loader />
        </LoaderContainer>
      </Container>
    );
  }

  if (error || !poi) {
    return (
      <Container>
        <Header>
          <BackButton onClick={handleBack}>←</BackButton>
          <HeaderTitle>Error</HeaderTitle>
        </Header>
        <ErrorMessage>{error || 'POI not found'}</ErrorMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <BackButton onClick={handleBack}>←</BackButton>
        <HeaderTitle>POI Details</HeaderTitle>
      </Header>

      <MapPlaceholder>
        Map View - {poi.location.latitude.toFixed(4)}, {poi.location.longitude.toFixed(4)}
      </MapPlaceholder>

      <Content>
        <Section>
          <POIName>{poi.name}</POIName>
          <CategoryBadge>{poi.category}</CategoryBadge>
          {poi.distance !== undefined && (
            <DistanceBadge>
              {formatDistance(poi.distance)}
            </DistanceBadge>
          )}
          <Description>{poi.description}</Description>
        </Section>

        <Section>
          <SectionTitle>Location</SectionTitle>
          <InfoGrid>
            <InfoItem>
              <InfoLabel>City</InfoLabel>
              <InfoValue>{poi.location.city || 'N/A'}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Country</InfoLabel>
              <InfoValue>{poi.location.country || 'N/A'}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Latitude</InfoLabel>
              <InfoValue>{poi.location.latitude.toFixed(6)}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Longitude</InfoLabel>
              <InfoValue>{poi.location.longitude.toFixed(6)}</InfoValue>
            </InfoItem>
          </InfoGrid>
        </Section>

        <Section>
          <SectionTitle>Reviews</SectionTitle>
          <ReviewItem>
            <ReviewHeader>
              <ReviewAuthor>John D.</ReviewAuthor>
              <ReviewRating>★★★★★</ReviewRating>
            </ReviewHeader>
            <ReviewText>
              Amazing experience! The AR features really brought the history to life.
            </ReviewText>
          </ReviewItem>
          <ReviewItem>
            <ReviewHeader>
              <ReviewAuthor>Sarah M.</ReviewAuthor>
              <ReviewRating>★★★★☆</ReviewRating>
            </ReviewHeader>
            <ReviewText>
              Great location with interesting historical facts. Would recommend visiting.
            </ReviewText>
          </ReviewItem>
          <ReviewItem>
            <ReviewHeader>
              <ReviewAuthor>Mike R.</ReviewAuthor>
              <ReviewRating>★★★★★</ReviewRating>
            </ReviewHeader>
            <ReviewText>
              The augmented reality tour was fantastic. Easy to use and very informative.
            </ReviewText>
          </ReviewItem>
        </Section>
      </Content>

      <FixedBottomBar>
        <Button
          variant="primary"
          size="large"
          fullWidth
          onClick={handleStartAR}
        >
          Start AR Experience
        </Button>
      </FixedBottomBar>
    </Container>
  );
};

export default POIDetailPage;
