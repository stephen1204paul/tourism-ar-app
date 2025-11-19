# Recommended Project Structure

## Directory Organization

```
tourism-ar-app/
├── .github/                    # GitHub specific files
│   ├── workflows/              # CI/CD workflows
│   └── ISSUE_TEMPLATE/         # Issue templates
│
├── frontend/                   # Frontend application
│   ├── public/                 # Static assets
│   │   ├── models/            # 3D models (GLTF/GLB)
│   │   ├── markers/           # AR markers
│   │   └── assets/            # Images, icons, fonts
│   │
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── ar/           # AR-specific components
│   │   │   ├── ui/           # UI components
│   │   │   └── common/        # Shared components
│   │   │
│   │   ├── services/          # Service layer
│   │   │   ├── ar/           # AR services
│   │   │   ├── api/          # API communication
│   │   │   └── location/     # Location services
│   │   │
│   │   ├── hooks/             # Custom React hooks
│   │   ├── utils/             # Utility functions
│   │   ├── store/             # State management (Redux/Context)
│   │   ├── types/             # TypeScript types
│   │   └── styles/            # Global styles
│   │
│   ├── tests/                 # Frontend tests
│   ├── package.json
│   └── tsconfig.json
│
├── backend/                    # Backend services
│   ├── api-gateway/           # API Gateway service
│   │   ├── src/
│   │   ├── tests/
│   │   └── package.json
│   │
│   ├── services/              # Microservices
│   │   ├── auth/             # Authentication service
│   │   ├── content/          # Content management service
│   │   ├── location/         # Location service
│   │   └── analytics/        # Analytics service
│   │
│   ├── shared/                # Shared backend code
│   │   ├── database/         # Database models and migrations
│   │   ├── utils/            # Shared utilities
│   │   └── types/            # Shared types
│   │
│   └── docker/                # Docker configurations
│       ├── development/
│       └── production/
│
├── mobile/                     # Mobile apps (if needed)
│   ├── ios/                  # iOS specific code
│   ├── android/              # Android specific code
│   └── shared/               # Shared mobile code
│
├── infrastructure/            # Infrastructure as Code
│   ├── terraform/            # Terraform configs
│   ├── kubernetes/           # K8s manifests
│   └── scripts/              # Deployment scripts
│
├── content-pipeline/          # Content processing tools
│   ├── optimization/         # 3D model optimization
│   ├── conversion/           # Format conversion tools
│   └── validation/           # Content validation
│
├── docs/                      # Documentation
│   ├── api/                  # API documentation
│   ├── architecture/         # Architecture diagrams
│   ├── guides/               # Development guides
│   └── content/              # Content creation guides
│
├── .env.example              # Environment variables template
├── docker-compose.yml        # Local development setup
├── README.md                 # Project overview
└── package.json              # Root package.json for scripts
```

## Key Directories Explained

### `/frontend`
The main web application built with React and AR.js. This is where the PWA lives.

### `/backend`
Microservices architecture with separate services for different domains. Each service can be deployed independently.

### `/infrastructure`
Infrastructure as Code files for deploying to cloud providers. Includes Terraform for resource provisioning and Kubernetes manifests for container orchestration.

### `/content-pipeline`
Tools and scripts for processing 3D models, images, and other media content. Includes optimization and validation tools.

### `/docs`
Comprehensive documentation including API specs, architecture diagrams, and development guides.

## File Naming Conventions

```typescript
// React Components
ComponentName.tsx           // Component file
ComponentName.test.tsx      // Test file
ComponentName.styles.ts     // Styled components
ComponentName.types.ts      // Component-specific types

// Services
serviceName.service.ts      // Service implementation
serviceName.test.ts         // Service tests
serviceName.types.ts        // Service types

// Utilities
utilityName.util.ts         // Utility function
utilityName.test.ts         // Utility tests

// AR Assets
landmark-name.glb          // 3D models (kebab-case)
marker-pattern.patt        // AR markers
```

## Module Organization Example

```typescript
// Example: POI Display Component Structure
/components/ar/POIDisplay/
├── index.ts                    // Public exports
├── POIDisplay.tsx              // Main component
├── POIDisplay.test.tsx         // Component tests
├── POIDisplay.styles.ts        // Styled components
├── POIDisplay.types.ts         // TypeScript interfaces
├── components/                 // Sub-components
│   ├── InfoCard.tsx
│   ├── InteractionMenu.tsx
│   └── LoadingState.tsx
└── hooks/                      // Component-specific hooks
    └── usePOIData.ts
```

## Configuration Files

### Root Level
- `.gitignore` - Git ignore rules
- `.eslintrc.js` - ESLint configuration
- `.prettierrc` - Prettier formatting
- `jest.config.js` - Jest testing configuration
- `docker-compose.yml` - Local development environment
- `.env.example` - Environment variables template

### Frontend
- `tsconfig.json` - TypeScript configuration
- `webpack.config.js` - Webpack bundler configuration
- `.babelrc` - Babel transpiler configuration
- `postcss.config.js` - PostCSS configuration

### Backend
- `nodemon.json` - Development server configuration
- `pm2.config.js` - Production process manager
- `.sequelizerc` - Database ORM configuration

## Database Schemas Location

```
/backend/shared/database/
├── migrations/                 # Database migrations
│   ├── 001_create_users.js
│   ├── 002_create_pois.js
│   └── 003_create_reviews.js
├── models/                    # ORM models
│   ├── User.model.ts
│   ├── POI.model.ts
│   └── Review.model.ts
├── seeds/                     # Seed data
│   ├── development/
│   └── test/
└── config/                    # Database configuration
    └── database.config.ts
```

## Testing Structure

```
/tests/
├── unit/                      # Unit tests
├── integration/               # Integration tests
├── e2e/                       # End-to-end tests
├── performance/               # Performance tests
├── ar/                        # AR-specific tests
└── fixtures/                  # Test data and mocks
```

## Asset Management

```
/public/
├── models/                    # 3D Models
│   ├── landmarks/            # Landmark models
│   │   ├── lod/             # Level-of-detail variants
│   │   ├── textures/        # Texture files
│   │   └── metadata/        # Model metadata
│   └── ui/                   # UI 3D elements
├── markers/                   # AR Markers
│   ├── patterns/             # Marker patterns
│   └── qrcodes/              # QR codes
└── media/                     # Media content
    ├── audio/                # Audio guides
    ├── video/                # Video content
    └── images/               # Images and photos
```

## Environment Configuration

```bash
# Development environment
/environments/
├── .env.development          # Development variables
├── .env.staging             # Staging variables
├── .env.production          # Production variables
└── .env.test                # Testing variables
```

## Build Output

```
/dist/                        # Production build
├── frontend/                 # Frontend bundle
├── backend/                  # Backend compiled code
└── assets/                   # Optimized assets
```

## CI/CD Pipeline Files

```
/.github/workflows/
├── ci.yml                    # Continuous Integration
├── cd.yml                    # Continuous Deployment
├── test.yml                  # Test automation
└── security.yml              # Security scanning
```

This structure supports:
- Microservices architecture
- Scalable development
- Clear separation of concerns
- Easy navigation
- Consistent organization
- Efficient collaboration