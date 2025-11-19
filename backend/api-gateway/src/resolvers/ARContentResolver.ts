import { Resolver, Query, Arg, ID } from 'type-graphql';
import { ARContent } from '../types/POI';

// Mock AR content data
const mockARContent: ARContent[] = [
  {
    id: '1',
    modelUrl: '/models/statue-of-liberty.glb',
    markerPattern: '/markers/liberty.patt',
    scale: 1.0,
  },
  {
    id: '2',
    modelUrl: '/models/eiffel-tower.glb',
    markerPattern: '/markers/eiffel.patt',
    scale: 1.0,
  },
];

@Resolver(ARContent)
export class ARContentResolver {
  @Query(() => ARContent, { nullable: true })
  async arContent(@Arg('poiId', () => ID) poiId: string): Promise<ARContent | undefined> {
    // In production, this would query the database by POI ID
    return mockARContent.find((content) => content.id === poiId);
  }

  @Query(() => [ARContent])
  async allARContent(): Promise<ARContent[]> {
    return mockARContent;
  }
}
