import { gql } from '@apollo/client';

// POI Queries
export const GET_ALL_POIS = gql`
  query GetAllPOIs {
    allPOIs {
      id
      name
      description
      category
      tags
      location {
        latitude
        longitude
        altitude
        address
        city
        country
      }
      arContent {
        id
        modelUrl
        markerPattern
        scale
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_POI = gql`
  query GetPOI($id: ID!) {
    poi(id: $id) {
      id
      name
      description
      category
      tags
      location {
        latitude
        longitude
        altitude
        address
        city
        country
      }
      arContent {
        id
        modelUrl
        markerPattern
        scale
        rotation
        metadata
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_NEARBY_POIS = gql`
  query GetNearbyPOIs($input: NearbyPOIInput!) {
    nearbyPOIs(input: $input) {
      id
      name
      description
      category
      tags
      location {
        latitude
        longitude
        altitude
        city
        country
      }
      arContent {
        id
        modelUrl
        markerPattern
        scale
      }
      distance
      createdAt
      updatedAt
    }
  }
`;

// User Queries
export const GET_ME = gql`
  query GetMe {
    me {
      id
      email
      username
      createdAt
      updatedAt
    }
  }
`;

// AR Content Queries
export const GET_AR_CONTENT = gql`
  query GetARContent($poiId: ID!) {
    arContent(poiId: $poiId) {
      id
      modelUrl
      markerPattern
      scale
      rotation
      metadata
    }
  }
`;

export const GET_ALL_AR_CONTENT = gql`
  query GetAllARContent {
    allARContent {
      id
      modelUrl
      markerPattern
      scale
    }
  }
`;

// Mutations
export const CREATE_POI = gql`
  mutation CreatePOI($input: POIInput!) {
    createPOI(input: $input) {
      id
      name
      description
      category
      tags
      location {
        latitude
        longitude
      }
      createdAt
      updatedAt
    }
  }
`;

export const REGISTER_USER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        email
        username
        createdAt
      }
    }
  }
`;

export const LOGIN_USER = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        email
        username
      }
    }
  }
`;
