# Event Management System - Backend

A robust NestJS backend API built with Test-Driven Development (TDD) principles.

## 🎯 Features Implemented

### ✅ Authentication Module
- User registration with email validation
- Login with JWT tokens (access + refresh)
- Refresh token mechanism (stored in database)
- Password verification for sensitive operations
- JWT Guards and Strategies
- 14/14 tests passing ✅

### ✅ Events Module
- Full CRUD operations
- Pagination, filtering, sorting, and search
- Status management (ONGOING/COMPLETED)
- Permission checks (users can only modify their own events)
- Public endpoints for user portal
- Password confirmation for deletion
- 15/15 tests passing ✅

### ✅ Uploads Module
- File upload with Multer
- Image validation (JPEG, PNG, WEBP)
- 5MB file size limit
- Static file serving
- Unique filename generation

## 🧪 Test Coverage

```
Test Suites: 5 passed
Tests:       30 passed
Coverage:    ~71% (Core modules >85%)
```

## 🏗️ Architecture

```
src/
├── auth/           # Authentication (JWT, Guards, Strategies)
├── events/         # Events CRUD with business logic
├── uploads/        # File upload handling
├── prisma/         # Database service
├── common/         # Shared decorators and utilities
└── main.ts         # Application entry point
```

## 📊 Database Schema

### Models:
- **Admin**: User accounts with email/password
- **RefreshToken**: JWT refresh tokens with expiration
- **Event**: Event details with status and poster

### Relationships:
- Admin → Events (one-to-many)
- Admin → RefreshTokens (one-to-many)

## 🚀 API Endpoints

### Authentication
```
POST   /auth/register        Register new admin
POST   /auth/login           Login (returns tokens)
POST   /auth/refresh         Refresh access token
POST   /auth/logout          Logout (invalidate token)
```

### Events (Protected)
```
GET    /events               List all events (paginated, filtered)
GET    /events/:id           Get single event
POST   /events               Create event
PATCH  /events/:id           Update event
DELETE /events/:id           Delete event (requires password)
```

### Events (Public)
```
GET    /events/public        List all events (for user portal)
GET    /events/public/:id    Get single event details
```

### Uploads
```
POST   /uploads              Upload event poster image
```

## 🔧 Technologies

- **NestJS**: Progressive Node.js framework
- **Prisma**: Type-safe ORM
- **PostgreSQL**: Relational database
- **JWT**: Authentication tokens
- **Bcrypt**: Password hashing
- **Class-validator**: DTO validation
- **Jest**: Testing framework
- **Multer**: File uploads

## 📝 Environment Variables

```env
DATABASE_URL=postgresql://user:pass@localhost:5433/event_system
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
NODE_ENV=development
PORT=3000
```

## 🧪 Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run specific test file
npm test -- auth.service.spec.ts
```

## 🏃 Running Locally

```bash
# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Start development server
npm run start:dev
```

## 🐳 Docker Setup

```bash
# From project root
docker-compose up --build -d backend
```

## ✨ Code Quality

- ✅ No TypeScript errors
- ✅ TDD approach (tests written first)
- ✅ Clean architecture with separation of concerns
- ✅ Comprehensive input validation
- ✅ Proper error handling
- ✅ Security best practices (password hashing, JWT, CORS)

## 🎓 TDD Approach

All features were built following the Red-Green-Refactor cycle:
1. 🔴 Write failing tests
2. 🟢 Write minimal code to pass tests
3. 🔵 Refactor while keeping tests green

This ensures:
- High code quality
- Comprehensive test coverage
- Confidence in refactoring
- Living documentation through tests
