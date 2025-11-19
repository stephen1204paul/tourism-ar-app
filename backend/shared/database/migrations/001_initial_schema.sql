-- Enable PostGIS extension for geospatial data
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create POIs (Points of Interest) table with geospatial support
CREATE TABLE IF NOT EXISTS pois (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    address VARCHAR(500),
    city VARCHAR(100),
    country VARCHAR(100),
    category VARCHAR(100),
    tags TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create spatial index for efficient location-based queries
CREATE INDEX IF NOT EXISTS idx_pois_location ON pois USING GIST(location);

-- Create index on category for filtering
CREATE INDEX IF NOT EXISTS idx_pois_category ON pois(category);

-- Create AR content table
CREATE TABLE IF NOT EXISTS ar_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poi_id UUID REFERENCES pois(id) ON DELETE CASCADE,
    model_url VARCHAR(500) NOT NULL,
    marker_pattern VARCHAR(500),
    scale NUMERIC(5,2) DEFAULT 1.0,
    rotation JSONB,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index on poi_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_ar_content_poi_id ON ar_content(poi_id);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poi_id UUID REFERENCES pois(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for reviews
CREATE INDEX IF NOT EXISTS idx_reviews_poi_id ON reviews(poi_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);

-- Create visited POIs table
CREATE TABLE IF NOT EXISTS visited_pois (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    poi_id UUID REFERENCES pois(id) ON DELETE CASCADE,
    visited_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, poi_id)
);

-- Create index for visited POIs
CREATE INDEX IF NOT EXISTS idx_visited_pois_user_id ON visited_pois(user_id);

-- Create bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    poi_id UUID REFERENCES pois(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, poi_id)
);

-- Create index for bookmarks
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);

-- Insert sample POI data
INSERT INTO pois (name, description, location, address, city, country, category, tags) VALUES
(
    'Statue of Liberty',
    'A colossal neoclassical sculpture on Liberty Island in New York Harbor',
    ST_SetSRID(ST_MakePoint(-74.0445, 40.6892), 4326)::geography,
    'Liberty Island',
    'New York',
    'USA',
    'monument',
    ARRAY['landmark', 'historical', 'statue']
),
(
    'Eiffel Tower',
    'A wrought-iron lattice tower on the Champ de Mars in Paris',
    ST_SetSRID(ST_MakePoint(2.2945, 48.8584), 4326)::geography,
    'Champ de Mars, 5 Avenue Anatole France',
    'Paris',
    'France',
    'monument',
    ARRAY['landmark', 'historical', 'tower']
),
(
    'Colosseum',
    'An oval amphitheatre in the centre of the city of Rome',
    ST_SetSRID(ST_MakePoint(12.4924, 41.8902), 4326)::geography,
    'Piazza del Colosseo, 1',
    'Rome',
    'Italy',
    'monument',
    ARRAY['landmark', 'historical', 'amphitheatre']
),
(
    'Great Wall of China',
    'A series of fortifications made of stone, brick, tamped earth, wood, and other materials',
    ST_SetSRID(ST_MakePoint(116.5704, 40.4319), 4326)::geography,
    'Huairou District',
    'Beijing',
    'China',
    'monument',
    ARRAY['landmark', 'historical', 'wall']
),
(
    'Taj Mahal',
    'An ivory-white marble mausoleum on the southern bank of the river Yamuna',
    ST_SetSRID(ST_MakePoint(78.0421, 27.1751), 4326)::geography,
    'Dharmapuri, Forest Colony',
    'Agra',
    'India',
    'monument',
    ARRAY['landmark', 'historical', 'mausoleum']
);

-- Insert corresponding AR content for sample POIs
INSERT INTO ar_content (poi_id, model_url, marker_pattern, scale) VALUES
(
    (SELECT id FROM pois WHERE name = 'Statue of Liberty'),
    '/models/statue-of-liberty.glb',
    '/markers/liberty.patt',
    1.0
),
(
    (SELECT id FROM pois WHERE name = 'Eiffel Tower'),
    '/models/eiffel-tower.glb',
    '/markers/eiffel.patt',
    1.0
),
(
    (SELECT id FROM pois WHERE name = 'Colosseum'),
    '/models/colosseum.glb',
    '/markers/colosseum.patt',
    1.0
),
(
    (SELECT id FROM pois WHERE name = 'Great Wall of China'),
    '/models/great-wall.glb',
    '/markers/great-wall.patt',
    1.0
),
(
    (SELECT id FROM pois WHERE name = 'Taj Mahal'),
    '/models/taj-mahal.glb',
    '/markers/taj-mahal.patt',
    1.0
);
