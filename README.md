# 🎉 Event Management System

A full-stack event management application with separate Admin and User portals, built with **Test-Driven Development (TDD)** principles.

## 📚 Documentation

### Quick Links

| Document | Description |
|----------|-------------|
| **[📋 Implementation Plan](./IMPLEMENTATION_PLAN.md)** | Overall project structure and implementation phases |
| **[🔐 Authentication Flows](./AUTH_FLOWS.md)** | Complete auth system with Mermaid diagrams |
| **[📊 Events Management Flows](./EVENTS_FLOWS.md)** | Events CRUD operations with Mermaid diagrams |
| **[🔧 Backend README](./backend/README.md)** | Backend API documentation and test results |
| **[🎨 Frontend README](./frontend/README.md)** | Frontend application documentation |

---

## ✨ Features

### Backend (NestJS + PostgreSQL)
- ✅ **Full Authentication System**
  - JWT with access + refresh tokens
  - Token rotation for security
  - Password verification for sensitive operations
  - 14 tests passing

- ✅ **Events Management**
  - Complete CRUD operations
  - Pagination, filtering, sorting, search
  - File upload (poster images)
  - Ownership checks
  - 15 tests passing

- ✅ **Test-Driven Development**
  - 30/30 tests passing (100%)
  - ~71% code coverage
  - Jest + Supertest
  - Red-Green-Refactor cycle

### Frontend (React + TypeScript)
- ✅ **Admin Portal**
  - Login & Register with form validation
  - Events List with table, pagination, filter, sort, search
  - Create Event form with file upload
  - Edit Event form with status change
  - Delete Event with password confirmation
  - Responsive design (mobile & desktop)

- ✅ **User Portal**
  - Events Gallery (thumbnail grid view)
  - Event Details page with full information
  - Public access (no authentication)
  - Responsive design

- ✅ **Technical Implementation**
  - Material UI v5 components
  - React Hook Form + Yup validation
  - TanStack Query for data fetching
  - Axios with automatic token refresh
  - Protected routes with AuthGuard
  - TDD for CreateEvent component (10 tests)

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local development)

### Start with Docker

```bash
# Clone repository
git clone <your-repo-url>
cd event-system

# Copy environment variables
cp .env.example .env

# Start all services
docker-compose up --build -d

# View logs
docker-compose logs -f backend
```

**Access:**
- Frontend (User Portal): http://localhost:5173
- Frontend (Admin Portal): http://localhost:5173/admin
- Backend API: http://localhost:3000
- Database: PostgreSQL on port 5433

---

## 🔐 Authentication Flow

**Quick Summary:**
1. User logs in → Receives access token (15min) + refresh token (7days)
2. Every API request → Send access token in `Authorization` header
3. Access token expires → Frontend auto-refreshes using refresh token
4. Both tokens are regenerated (token rotation for security)
5. Active users stay logged in indefinitely!

**[→ See detailed diagrams in AUTH_FLOWS.md](./AUTH_FLOWS.md)**

---

## 📊 Events Management

**Endpoints:**

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/events` | ✅ | List events (pagination, filter, sort, search) |
| GET | `/events/:id` | ✅ | Get event details |
| POST | `/events` | ✅ | Create event |
| PATCH | `/events/:id` | ✅ | Update event |
| DELETE | `/events/:id` | ✅ + Password | Delete event |
| GET | `/events/public` | ❌ | Public list (user portal) |
| GET | `/events/public/:id` | ❌ | Public details (user portal) |
| POST | `/uploads` | ❌ | Upload poster image |

**[→ See detailed diagrams in EVENTS_FLOWS.md](./EVENTS_FLOWS.md)**

---

## 🧪 Testing

```bash
# Run all tests
cd backend
npm test

# Run with coverage
npm run test:cov

# Run specific test
npm test -- auth.service.spec.ts

# Watch mode
npm run test:watch
```

**Current Results:**
```
✅ 30/30 tests passing
✅ 5/5 test suites passing
✅ ~71% code coverage
✅ 0 TypeScript errors
```

---

## 🏗️ Tech Stack

### Backend
- **Framework**: NestJS 11
- **Database**: PostgreSQL 16 (Dockerized)
- **ORM**: Prisma 6
- **Authentication**: JWT (passport-jwt)
- **Validation**: class-validator
- **File Upload**: Multer
- **Testing**: Jest + Supertest

### Frontend
- **Framework**: React 18 + TypeScript
- **Styling**: Material UI v5
- **Forms**: React Hook Form + Yup
- **Data Fetching**: TanStack Query
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Build Tool**: Vite
- **Testing**: Vitest + React Testing Library

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Development**: Hot reload enabled
- **Database**: PostgreSQL with migrations

---

## 📁 Project Structure

```
event-system/
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── auth/           # Authentication (14 tests ✅)
│   │   ├── events/         # Events CRUD (15 tests ✅)
│   │   ├── uploads/        # File handling
│   │   ├── prisma/         # Database service
│   │   └── common/         # Shared utilities
│   ├── prisma/             # Database schema & migrations
│   ├── test/               # E2E tests
│   └── uploads/            # Static files
│
├── frontend/               # React app
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # Auth context
│   │   ├── layouts/        # Admin & User layouts
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── test/           # Test setup
│   │   └── types/          # TypeScript types
│   ├── Dockerfile
│   └── vite.config.ts
│
├── AUTH_FLOWS.md           # 🔐 Auth diagrams
├── EVENTS_FLOWS.md         # 📊 Events diagrams
├── IMPLEMENTATION_PLAN.md  # 📋 Implementation guide
├── docker-compose.yml      # 🐳 Docker orchestration
└── .env                    # 🔒 Environment variables (include in repo per requirements)
```

---

## 🔒 Security Features

- ✅ Password hashing (bcrypt, 10 rounds)
- ✅ JWT authentication
- ✅ Token rotation (prevents replay attacks)
- ✅ Refresh tokens stored in database (revocable)
- ✅ Password verification for sensitive operations
- ✅ Input validation (class-validator)
- ✅ File upload validation
- ✅ Ownership checks
- ✅ CORS enabled

---

## 📝 Environment Variables

See `.env` file (included per requirements):

```env
# Database
DB_USER=eventadmin
DB_PASSWORD=securepassword123
DB_NAME=event_system

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production-min-32-chars
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Backend
PORT=3000
NODE_ENV=development

# Frontend
VITE_API_URL=http://localhost:3000
```

---

## ✅ Requirements Checklist

### Minimum Requirements
- ✅ TypeScript (Backend + Frontend)
- ✅ React + Material UI frontend
- ✅ React Hook Form with validation
- ✅ TanStack Query for data fetching
- ✅ NestJS backend
- ✅ Prisma + PostgreSQL
- ✅ MVC structure
- ✅ JWT authentication with AuthGuard
- ✅ Password encryption (bcrypt)
- ✅ Complete dockerization

### Bonus Features
- ✅ class-validator for input validation
- ✅ Refresh token mechanism
- ✅ Pagination
- ✅ Responsive design
- ✅ Filtering and sorting
- ✅ Search functionality

### Extra (Beyond Requirements)
- ✅ **Full TDD approach** (Tests written first!)
- ✅ Comprehensive flow diagrams (Mermaid)
- ✅ Docker containerization
- ✅ Token rotation security
- ✅ File upload with validation
- ✅ Search & filtering
- ✅ Extensive documentation

---

## 🎯 API Examples

### Register
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password123"}'
```

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password123"}'
```

### Create Event
```bash
curl -X POST http://localhost:3000/events \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tech Conference 2025",
    "startDate": "2025-03-01",
    "endDate": "2025-03-03",
    "location": "Singapore",
    "posterUrl": "/uploads/file-123.jpg"
  }'
```

### List Events with Filters
```bash
curl "http://localhost:3000/events?page=1&limit=10&sortBy=startDate&sortOrder=asc&status=ONGOING&search=tech" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 🤝 Contributing

This project was built with TDD principles. When adding features:

1. **Write tests first** (Red)
2. **Implement minimal code** to pass tests (Green)
3. **Refactor** while keeping tests green (Refactor)
4. Maintain >80% test coverage
5. Update flow diagrams if needed

---

## 📄 License

UNLICENSED (Private assessment project)

---

**Built with 💙 following TDD best practices**

Last Updated: 2025-11-10
