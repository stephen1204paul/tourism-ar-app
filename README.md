# Tourism AR App

An innovative Augmented Reality (AR) application designed to enhance tourism experiences by overlaying digital content on real-world landmarks and locations.

## Overview

This application provides tourists with an immersive way to explore destinations through:
- AR visualization of historical landmarks
- Interactive 3D models and reconstructions
- Location-based information and navigation
- Multimedia content (audio guides, videos)
- Social features and user-generated content

## Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- Docker and Docker Compose
- Git
- Modern web browser with WebRTC support

### Installation

1. **Clone the repository**
```bash
git clone [repository-url]
cd tourism-ar-app
```

2. **Install dependencies**
```bash
npm run setup
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start development environment**
```bash
npm run dev
```

This will:
- Start all required services via Docker
- Launch the frontend development server
- Set up the database with initial schema

5. **Access the application**
- Frontend: http://localhost:3000
- API Gateway: http://localhost:4000/graphql
- MinIO Console: http://localhost:9001 (minioadmin/minioadmin123)

## Project Structure

```
tourism-ar-app/
├── frontend/          # React PWA with AR.js
├── backend/           # Microservices architecture
├── infrastructure/    # IaC and deployment configs
├── content-pipeline/  # Content processing tools
└── docs/             # Documentation
```

For detailed structure, see [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)

## Development

### Available Scripts

```bash
# Development
npm run dev              # Start all services
npm run dev:frontend     # Start only frontend
npm run dev:backend      # Start only backend

# Testing
npm test                 # Run all tests
npm run test:frontend    # Test frontend
npm run test:backend     # Test backend

# Building
npm run build           # Build all services
npm run lint            # Lint code
npm run format          # Format code

# Database
npm run db:migrate      # Run migrations
npm run db:seed         # Seed database

# Docker
npm run docker:up       # Start Docker services
npm run docker:down     # Stop Docker services
npm run docker:logs     # View logs
```

### Technology Stack

- **Frontend**: React, TypeScript, AR.js, Three.js, PWA
- **Backend**: Node.js, Express, GraphQL, PostgreSQL, MongoDB, Redis
- **Infrastructure**: Docker, Kubernetes, AWS/GCP
- **AR Technology**: AR.js for web-based AR experiences

## Features

### Core Features (MVP)
- [x] AR marker detection and tracking
- [x] 3D model rendering on markers
- [x] GPS-based POI detection
- [x] Basic POI information display
- [ ] User location tracking
- [ ] Content caching

### Enhanced Features
- [ ] AR navigation and wayfinding
- [ ] Audio guides with spatial audio
- [ ] Multi-language support
- [ ] User accounts and preferences
- [ ] Social sharing features
- [ ] Offline mode

### Advanced Features
- [ ] SLAM-based tracking
- [ ] User-generated AR content
- [ ] Real-time collaboration
- [ ] AR portals and time travel
- [ ] Gamification elements

## API Documentation

### GraphQL Endpoint
```
http://localhost:4000/graphql
```

### Example Queries

```graphql
# Get nearby POIs
query GetNearbyPOIs($lat: Float!, $lng: Float!, $radius: Float!) {
  nearbyPOIs(lat: $lat, lng: $lng, radius: $radius) {
    id
    name
    description
    location {
      latitude
      longitude
    }
    arContent {
      modelUrl
      scale
    }
  }
}

# Get POI details
query GetPOI($id: ID!) {
  poiById(id: $id) {
    id
    name
    description
    multimedia {
      type
      url
      description
    }
    reviews {
      rating
      comment
      user {
        name
      }
    }
  }
}
```

## Testing

### Running Tests

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# AR-specific tests
npm run test:ar
```

### Testing AR Features

1. Use the AR testing tool:
```bash
npm run ar:test -- --device=iPhone12
```

2. Test with different markers:
- Place test markers in `/frontend/public/markers/test/`
- Access test mode at http://localhost:3000/test-ar

## Deployment

### Production Build

```bash
# Build all services
npm run build

# Build Docker images
docker-compose -f docker-compose.prod.yml build

# Deploy to Kubernetes
kubectl apply -f infrastructure/kubernetes/
```

### Environment Configuration

Create environment-specific files:
- `.env.development` - Development settings
- `.env.staging` - Staging settings
- `.env.production` - Production settings

## Contributing

Please read [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

### Development Guidelines

1. **Code Style**: Follow the ESLint and Prettier configurations
2. **Commits**: Use conventional commit messages
3. **Testing**: Write tests for new features
4. **Documentation**: Update docs for API changes
5. **AR Content**: Follow optimization guidelines in content-pipeline

## Performance Optimization

### AR Performance Tips
- Keep 3D models under 50k polygons
- Use texture atlasing
- Implement LOD (Level of Detail) systems
- Optimize marker detection frequency
- Use progressive loading for content

### Battery Management
- Implement adaptive frame rates
- Reduce GPS polling frequency when stationary
- Provide power-saving mode options
- Lazy load non-essential features

## Security

### Security Measures
- HTTPS enforced in production
- JWT-based authentication
- Rate limiting on API endpoints
- Input validation and sanitization
- Content Security Policy headers

Report security vulnerabilities to: security@tourism-ar-app.com

## Troubleshooting

### Common Issues

**AR tracking not working:**
- Ensure camera permissions are granted
- Check lighting conditions
- Verify marker quality and size

**Location services issues:**
- Enable GPS/location services
- Check for HTTPS (required for geolocation API)
- Verify location permissions

**3D models not loading:**
- Check CORS settings
- Verify model format (GLTF/GLB)
- Check file size and optimization

## Resources

- [Development Plan](./AR_TOURISM_APP_PLAN.md)
- [API Documentation](./docs/api/README.md)
- [Content Creation Guide](./docs/content/CONTENT_GUIDE.md)
- [Architecture Diagrams](./docs/architecture/README.md)

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## Support

- Documentation: [docs.tourism-ar-app.com](https://docs.tourism-ar-app.com)
- Issues: [GitHub Issues](https://github.com/your-org/tourism-ar-app/issues)
- Email: support@tourism-ar-app.com
- Discord: [Join our community](https://discord.gg/tourism-ar)

## Acknowledgments

- AR.js community for the excellent AR framework
- Three.js for 3D graphics capabilities
- OpenStreetMap for mapping data
- All contributors and testers

---

Built with passion for enhancing tourism experiences through AR technology.