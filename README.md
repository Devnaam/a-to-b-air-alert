# AirAlert Pro Backend API

A comprehensive backend API for air quality-aware route planning and health impact tracking.

## Features

- 🔐 **User Authentication & Authorization**
- 🗺️ **Route Planning with Air Quality Integration**
- 🏥 **Health Profile Management**
- 📊 **Trip Analytics & Exposure Tracking**
- ⚡ **Real-time Air Quality Monitoring**
- 🎯 **Proactive Health Alerts**
- 📱 **Mobile-Ready RESTful API**

## Quick Start

### Prerequisites

- Node.js 16+
- PostgreSQL 12+
- Google Maps API Key
- Air Quality API Token (WAQI)

### Installation

1. Install dependencies

   ```bash
   npm install
   ```

2. Set up environment variables

   ```bash
   cp .env.example .env
   ```

3. Edit `.env` with your configuration

4. Set up database

   ```bash
   npm run migrate
   npm run seed
   ```

5. Start development server
   ```bash
   npm run dev
   ```

### Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/airalert_pro

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# External APIs
GOOGLE_MAPS_API_KEY=your_google_maps_key
WAQI_API_TOKEN=your_waqi_token

# CORS
FRONTEND_URL=http://localhost:5173
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-token` - Token verification
- `GET /api/auth/profile` - Get user profile

### Routes

- `POST /api/routes/plan` - Plan routes with AQI analysis
- `POST /api/routes/geocode` - Geocode addresses
- `GET /api/routes/popular` - Get popular routes
- `POST /api/routes/analyze` - Analyze single route

### Trips

- `POST /api/trips` - Create new trip
- `GET /api/trips` - Get user trips
- `GET /api/trips/stats` - Get trip statistics
- `GET /api/trips/insights` - Get personalized insights
- `PUT /api/trips/:id` - Update trip

### Users

- `GET /api/users/dashboard` - User dashboard data
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/preferences` - Get user preferences

## Database Schema

### Users

- Profile information
- Health conditions
- Preferences & settings
- Authentication data

### Trips

- Route data
- Air quality measurements
- Health actions taken
- Trip status & timing

### Routes (Cache)

- Popular route patterns
- Cached AQI data
- Usage statistics

## Services

### Air Quality Service

- WAQI API integration
- OpenWeather fallback
- Mock data generation
- Route AQI analysis

### Maps Service

- Google Maps integration
- Route calculation
- Geocoding services
- Mock route generation

### Route Analysis Service

- Health impact calculation
- Breathability scoring
- Proactive alert generation
- Time-based recommendations

## Development

```bash
# Install dependencies
npm install

# Run migrations
npm run migrate

# Seed database
npm run seed

# Start development server
npm run dev

# Run tests
npm test
```

## Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

## API Documentation

### Authentication Required

Most endpoints require a Bearer token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

### Response Format

All responses follow this structure:

```json
{
	"status": "success|error",
	"message": "Response message",
	"data": {}
}
```

### Error Handling

Errors return appropriate HTTP status codes with descriptive messages:

```json
{
	"status": "error",
	"message": "Error description"
}
```

## Health & Monitoring

- Health check: `GET /health`
- API stats: `GET /api/routes/stats`
- Comprehensive logging with Winston
- Error tracking and monitoring

## Security Features

- JWT-based authentication
- Input validation with Joi
- Rate limiting
- CORS protection
- Helmet security headers
- SQL injection prevention

## License

MIT License - see LICENSE file for details

## Getting Started

```bash
cd backend
npm install
npm run migrate
npm run seed
npm run dev
```


<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/e6105a46-2adc-400d-8923-c604dbe3502d" />

```
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/1630d152-9312-454d-99af-a905622559ef" />
```
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/175fe28c-5d45-47c4-8979-e0da92322501" />

```

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/ab170d72-5cbe-4b3b-8f14-8f2110fca46e" />

