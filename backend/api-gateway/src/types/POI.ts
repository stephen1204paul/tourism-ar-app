import { ObjectType, Field, ID, Float, InputType } from 'type-graphql';

@ObjectType()
export class Location {
  @Field(() => Float)
  latitude: number;

  @Field(() => Float)
  longitude: number;

  @Field(() => Float, { nullable: true })
  altitude?: number;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  city?: string;

  @Field({ nullable: true })
  country?: string;
}

@ObjectType()
export class ARContent {
  @Field(() => ID)
  id: string;

  @Field()
  modelUrl: string;

  @Field({ nullable: true })
  markerPattern?: string;

  @Field(() => Float)
  scale: number;

  @Field({ nullable: true })
  rotation?: string; // JSON string

  @Field({ nullable: true })
  metadata?: string; // JSON string
}

@ObjectType()
export class POI {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field(() => Location)
  location: Location;

  @Field()
  category: string;

  @Field(() => [String])
  tags: string[];

  @Field(() => ARContent, { nullable: true })
  arContent?: ARContent;

  @Field(() => Float, { nullable: true })
  distance?: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@InputType()
export class POIInput {
  @Field()
  name: string;

  @Field()
  description: string;

  @Field(() => Float)
  latitude: number;

  @Field(() => Float)
  longitude: number;

  @Field({ nullable: true })
  category?: string;

  @Field(() => [String], { nullable: true })
  tags?: string[];
}

@InputType()
export class NearbyPOIInput {
  @Field(() => Float)
  latitude: number;

  @Field(() => Float)
  longitude: number;

  @Field(() => Float, { defaultValue: 500 })
  radius?: number;
}
