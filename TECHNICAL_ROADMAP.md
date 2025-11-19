# Technical Implementation Roadmap

## Sprint 1: Foundation Setup (Week 1-2)

### Tasks

#### 1. Project Initialization
```bash
# Create frontend application
npx create-react-app frontend --template typescript
cd frontend
npm install three @types/three ar.js aframe aframe-react

# Setup backend services
mkdir -p backend/{api-gateway,services/{auth,content,location}}
cd backend/api-gateway
npm init -y
npm install express apollo-server-express graphql type-graphql
```

#### 2. Database Schema
```sql
-- Core tables for PostgreSQL with PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE pois (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    category VARCHAR(100),
    tags TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_pois_location ON pois USING GIST(location);

CREATE TABLE ar_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poi_id UUID REFERENCES pois(id) ON DELETE CASCADE,
    model_url VARCHAR(500),
    marker_pattern VARCHAR(500),
    scale NUMERIC(5,2) DEFAULT 1.0,
    rotation JSONB,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### 3. Basic AR Component
```typescript
// frontend/src/components/ar/ARViewer.tsx
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ARViewerProps {
  markerUrl: string;
  modelUrl: string;
  scale?: number;
}

export const ARViewer: React.FC<ARViewerProps> = ({
  markerUrl,
  modelUrl,
  scale = 1
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize AR.js and Three.js
    // Load marker pattern
    // Load 3D model
    // Setup AR tracking
  }, [markerUrl, modelUrl]);

  return (
    <div ref={mountRef} className="ar-viewer">
      <a-scene
        embedded
        arjs="sourceType: webcam; debugUIEnabled: false;"
      >
        <a-marker preset="pattern" url={markerUrl}>
          <a-entity
            gltf-model={`url(${modelUrl})`}
            scale={`${scale} ${scale} ${scale}`}
          />
        </a-marker>
        <a-entity camera></a-entity>
      </a-scene>
    </div>
  );
};
```

## Sprint 2: Core AR Implementation (Week 3-4)

### AR Tracking Service
```typescript
// frontend/src/services/ar/ARTrackingService.ts
export class ARTrackingService {
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private renderer: THREE.WebGLRenderer;
  private arToolkitSource: any;
  private arToolkitContext: any;

  constructor(container: HTMLElement) {
    this.initializeThreeJS(container);
    this.initializeARToolkit();
  }

  private initializeThreeJS(container: HTMLElement) {
    this.scene = new THREE.Scene();

    this.camera = new THREE.Camera();
    this.scene.add(this.camera);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    this.renderer.setClearColor(new THREE.Color('lightgrey'), 0);
    this.renderer.setSize(640, 480);
    this.renderer.domElement.style.position = 'absolute';
    this.renderer.domElement.style.top = '0px';
    this.renderer.domElement.style.left = '0px';
    container.appendChild(this.renderer.domElement);
  }

  private initializeARToolkit() {
    // AR.js initialization
    this.arToolkitSource = new THREEx.ArToolkitSource({
      sourceType: 'webcam',
    });

    this.arToolkitSource.init(() => {
      this.onResize();
    });

    this.arToolkitContext = new THREEx.ArToolkitContext({
      cameraParametersUrl: '/data/camera_para.dat',
      detectionMode: 'mono'
    });

    this.arToolkitContext.init(() => {
      this.camera.projectionMatrix.copy(
        this.arToolkitContext.getProjectionMatrix()
      );
    });
  }

  public addMarker(pattern: string, onDetected: () => void) {
    const markerRoot = new THREE.Group();
    this.scene.add(markerRoot);

    const markerControls = new THREEx.ArMarkerControls(
      this.arToolkitContext,
      markerRoot,
      {
        type: 'pattern',
        patternUrl: pattern,
      }
    );

    return markerRoot;
  }

  public loadModel(url: string): Promise<THREE.Object3D> {
    return new Promise((resolve, reject) => {
      const loader = new THREE.GLTFLoader();
      loader.load(
        url,
        (gltf) => resolve(gltf.scene),
        (progress) => console.log('Loading:', progress),
        (error) => reject(error)
      );
    });
  }

  private onResize() {
    this.arToolkitSource.onResize();
    this.arToolkitSource.copySizeTo(this.renderer.domElement);
    if (this.arToolkitContext.arController !== null) {
      this.arToolkitSource.copySizeTo(
        this.arToolkitContext.arController.canvas
      );
    }
  }

  public update() {
    if (this.arToolkitSource.ready !== false) {
      this.arToolkitContext.update(this.arToolkitSource.domElement);
    }
  }

  public render() {
    this.renderer.render(this.scene, this.camera);
  }
}
```

## Sprint 3: Location Services (Week 5-6)

### Location-based POI Detection
```typescript
// frontend/src/services/location/LocationService.ts
export interface Location {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy: number;
}

export interface POI {
  id: string;
  name: string;
  location: Location;
  distance?: number;
}

export class LocationService {
  private watchId?: number;
  private currentLocation?: Location;

  public startTracking(callback: (location: Location) => void): void {
    if (!navigator.geolocation) {
      throw new Error('Geolocation not supported');
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        this.currentLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          altitude: position.coords.altitude || undefined,
          accuracy: position.coords.accuracy
        };
        callback(this.currentLocation);
      },
      (error) => {
        console.error('Location error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }

  public stopTracking(): void {
    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = undefined;
    }
  }

  public calculateDistance(
    point1: Location,
    point2: Location
  ): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = point1.latitude * Math.PI / 180;
    const φ2 = point2.latitude * Math.PI / 180;
    const Δφ = (point2.latitude - point1.latitude) * Math.PI / 180;
    const Δλ = (point2.longitude - point1.longitude) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  }

  public async findNearbyPOIs(
    radius: number = 500
  ): Promise<POI[]> {
    if (!this.currentLocation) {
      throw new Error('Location not available');
    }

    const response = await fetch('/api/pois/nearby', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        latitude: this.currentLocation.latitude,
        longitude: this.currentLocation.longitude,
        radius
      })
    });

    const pois = await response.json();

    // Calculate distances
    return pois.map((poi: POI) => ({
      ...poi,
      distance: this.calculateDistance(
        this.currentLocation!,
        poi.location
      )
    })).sort((a: POI, b: POI) =>
      (a.distance || 0) - (b.distance || 0)
    );
  }

  public getBearing(
    from: Location,
    to: Location
  ): number {
    const φ1 = from.latitude * Math.PI / 180;
    const φ2 = to.latitude * Math.PI / 180;
    const Δλ = (to.longitude - from.longitude) * Math.PI / 180;

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) -
              Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

    const θ = Math.atan2(y, x);

    return (θ * 180 / Math.PI + 360) % 360; // Bearing in degrees
  }
}
```

## Sprint 4: Content Management (Week 7-8)

### GraphQL API Schema
```graphql
# backend/api-gateway/src/schema.graphql
type Query {
  # POI Queries
  poi(id: ID!): POI
  nearbyPOIs(
    latitude: Float!
    longitude: Float!
    radius: Float = 500
  ): [POI!]!
  searchPOIs(query: String!, limit: Int = 10): [POI!]!

  # User Queries
  me: User
  userHistory(limit: Int = 50): [VisitedPOI!]!

  # Content Queries
  arContent(poiId: ID!): ARContent
  availableLanguages: [Language!]!
}

type Mutation {
  # Auth Mutations
  register(input: RegisterInput!): AuthPayload!
  login(email: String!, password: String!): AuthPayload!
  refreshToken(token: String!): AuthPayload!

  # POI Mutations
  createPOI(input: POIInput!): POI!
  updatePOI(id: ID!, input: POIInput!): POI!
  deletePOI(id: ID!): Boolean!

  # User Actions
  visitPOI(poiId: ID!): VisitedPOI!
  ratePOI(poiId: ID!, rating: Int!, review: String): Review!
  bookmarkPOI(poiId: ID!): Bookmark!

  # AR Content
  uploadARModel(input: ARModelInput!): ARContent!
  updateARContent(id: ID!, input: ARContentInput!): ARContent!
}

type Subscription {
  nearbyPOIUpdates(
    latitude: Float!
    longitude: Float!
    radius: Float!
  ): POIUpdate!

  liveGuideStream(tourId: ID!): GuideUpdate!
}

type POI {
  id: ID!
  name: String!
  description: String!
  location: Location!
  category: Category!
  tags: [String!]!
  images: [Image!]!
  arContent: ARContent
  reviews: [Review!]!
  rating: Float
  openingHours: OpeningHours
  contactInfo: ContactInfo
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Location {
  latitude: Float!
  longitude: Float!
  altitude: Float
  address: String
  city: String
  country: String
}

type ARContent {
  id: ID!
  poi: POI!
  modelUrl: String!
  markerPattern: String
  scale: Float!
  rotation: Rotation!
  animations: [Animation!]!
  interactionPoints: [InteractionPoint!]!
  audioGuides: [AudioGuide!]!
}

type Animation {
  name: String!
  trigger: AnimationTrigger!
  loop: Boolean!
  duration: Float!
}

enum AnimationTrigger {
  ON_LOAD
  ON_TAP
  ON_PROXIMITY
  ON_LOOK_AT
}

type InteractionPoint {
  id: ID!
  position: Vector3!
  label: String!
  action: InteractionAction!
  data: String
}

enum InteractionAction {
  SHOW_INFO
  PLAY_AUDIO
  PLAY_VIDEO
  NAVIGATE_TO
  OPEN_URL
}
```

## Sprint 5: UI/UX Implementation (Week 9-10)

### Component Library Structure
```typescript
// frontend/src/components/ui/index.ts
export { Card } from './Card';
export { Button } from './Button';
export { Modal } from './Modal';
export { Loader } from './Loader';
export { Icon } from './Icon';
export { Badge } from './Badge';
export { Avatar } from './Avatar';
export { Rating } from './Rating';

// AR-specific UI components
export { AROverlay } from './AROverlay';
export { POICard } from './POICard';
export { NavigationHUD } from './NavigationHUD';
export { InteractionMenu } from './InteractionMenu';
export { DistanceIndicator } from './DistanceIndicator';
export { CompassView } from './CompassView';
```

### PWA Configuration
```javascript
// frontend/public/manifest.json
{
  "short_name": "AR Tourism",
  "name": "AR Tourism Experience App",
  "description": "Explore the world through augmented reality",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    },
    {
      "src": "logo192.png",
      "type": "image/png",
      "sizes": "192x192"
    },
    {
      "src": "logo512.png",
      "type": "image/png",
      "sizes": "512x512"
    }
  ],
  "start_url": ".",
  "display": "fullscreen",
  "theme_color": "#000000",
  "background_color": "#ffffff",
  "orientation": "portrait",
  "permissions": [
    "camera",
    "geolocation",
    "storage"
  ]
}
```

### Service Worker
```javascript
// frontend/src/serviceWorker.js
const CACHE_NAME = 'ar-tourism-v1';
const urlsToCache = [
  '/',
  '/static/css/main.css',
  '/static/js/bundle.js',
  '/models/default-marker.patt',
  '/offline.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
      .catch(() => {
        if (event.request.destination === 'document') {
          return caches.match('/offline.html');
        }
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', event => {
  if (event.tag === 'sync-visits') {
    event.waitUntil(syncVisitedPOIs());
  }
});
```

## Performance Optimization Checklist

### 3D Model Optimization
- [ ] Implement Draco compression for GLTF models
- [ ] Create LOD (Level of Detail) variants
- [ ] Optimize textures (max 2048x2048 for mobile)
- [ ] Use texture atlases where possible
- [ ] Implement progressive loading

### AR Tracking Optimization
- [ ] Adjust tracking frequency based on device capability
- [ ] Implement marker pooling for multiple markers
- [ ] Use simplified collision detection
- [ ] Cache marker patterns locally
- [ ] Implement frustum culling

### Network Optimization
- [ ] Implement request batching
- [ ] Use GraphQL query complexity analysis
- [ ] Implement data loader pattern
- [ ] Set up CDN for static assets
- [ ] Use WebP/AVIF for images

### Battery Optimization
- [ ] Implement adaptive quality settings
- [ ] Reduce GPS polling when stationary
- [ ] Offer power-saving mode
- [ ] Background task scheduling
- [ ] Screen brightness recommendations

## Testing Strategy

### Unit Tests
```typescript
// Example test for LocationService
describe('LocationService', () => {
  let service: LocationService;

  beforeEach(() => {
    service = new LocationService();
  });

  test('calculates distance correctly', () => {
    const point1 = {
      latitude: 40.7128,
      longitude: -74.0060,
      accuracy: 10
    };
    const point2 = {
      latitude: 40.7580,
      longitude: -73.9855,
      accuracy: 10
    };

    const distance = service.calculateDistance(point1, point2);
    expect(distance).toBeCloseTo(5570, -2); // ~5.57km
  });

  test('calculates bearing correctly', () => {
    const from = {
      latitude: 40.7128,
      longitude: -74.0060,
      accuracy: 10
    };
    const to = {
      latitude: 40.7580,
      longitude: -73.9855,
      accuracy: 10
    };

    const bearing = service.getBearing(from, to);
    expect(bearing).toBeCloseTo(16.17, 1);
  });
});
```

### AR Testing Framework
```typescript
// Custom AR testing utilities
export class ARTestUtils {
  static createMockMarker(pattern: string) {
    return {
      pattern,
      detected: false,
      position: new THREE.Vector3(),
      rotation: new THREE.Euler(),
      scale: new THREE.Vector3(1, 1, 1)
    };
  }

  static simulateMarkerDetection(marker: any) {
    marker.detected = true;
    // Trigger detection event
  }

  static create3DTestScene() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    return { scene, camera, renderer };
  }

  static loadTestModel(path: string): Promise<THREE.Object3D> {
    // Load test 3D model
  }
}
```

## Deployment Configuration

### Docker Setup
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Kubernetes Deployment
```yaml
# infrastructure/kubernetes/frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ar-tourism-frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ar-tourism-frontend
  template:
    metadata:
      labels:
        app: ar-tourism-frontend
    spec:
      containers:
      - name: frontend
        image: ar-tourism/frontend:latest
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
---
apiVersion: v1
kind: Service
metadata:
  name: ar-tourism-frontend
spec:
  selector:
    app: ar-tourism-frontend
  ports:
  - port: 80
    targetPort: 80
  type: LoadBalancer
```

## Monitoring and Analytics

### Performance Monitoring
```typescript
// frontend/src/utils/performance.ts
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  public startMeasure(name: string): void {
    performance.mark(`${name}-start`);
  }

  public endMeasure(name: string): void {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);

    const measure = performance.getEntriesByName(name)[0];
    this.recordMetric(name, measure.duration);
  }

  private recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);
  }

  public getAverageMetric(name: string): number {
    const values = this.metrics.get(name) || [];
    if (values.length === 0) return 0;

    const sum = values.reduce((a, b) => a + b, 0);
    return sum / values.length;
  }

  public reportToAnalytics(): void {
    const report = {
      fps: this.getAverageMetric('frame'),
      arTracking: this.getAverageMetric('ar-tracking'),
      modelLoad: this.getAverageMetric('model-load'),
      apiResponse: this.getAverageMetric('api-response')
    };

    // Send to analytics service
    console.log('Performance Report:', report);
  }
}
```

This roadmap provides concrete implementation details and code examples for each sprint, giving the development team a clear path forward for building the AR tourism application.