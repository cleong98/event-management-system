# Event Management System - Implementation Plan

## Overview
A dockerized full-stack event management application with separate Admin and User portals.

**Priority: Docker-first approach with simple, maintainable architecture.**

## 🚨 CRITICAL: Test-Driven Development (TDD) Approach

**ALL backend development MUST follow TDD principles:**

1. **Write tests FIRST** - Before implementing any feature
2. **Red-Green-Refactor cycle**:
   - 🔴 Red: Write a failing test
   - 🟢 Green: Write minimal code to pass the test
   - 🔵 Refactor: Improve code while keeping tests green
3. **Test coverage**: Aim for >80% coverage on backend
4. **Testing layers**:
   - Unit tests: Services, utilities, guards
   - Integration tests: Controllers with database
   - E2E tests: Complete API workflows

**Testing is NOT optional - it's the foundation of quality software.**

---

## 📚 Flow Diagrams & Documentation

For detailed visual flow diagrams with Mermaid charts, see:

### 🔐 Authentication Flows
**[→ View AUTH_FLOWS.md](./AUTH_FLOWS.md)**

Complete authentication system documentation including:
- Registration & Login flow
- Token validation on every request
- Automatic token refresh mechanism
- Token rotation strategy (security)
- Password verification for sensitive operations
- Logout flow
- FAQ section

### 📊 Events Management Flows
**[→ View EVENTS_FLOWS.md](./EVENTS_FLOWS.md)**

Complete events CRUD operations documentation including:
- Create event with file upload
- List events with pagination, filtering, sorting, search
- Update event with status change
- Delete event with password verification
- Public events for user portal
- File upload validation flow
- Quick reference for all endpoints

---

## 🎯 Quick Start Summary

### Authentication Strategy
- **Access Token**: 15 minutes expiry, sent in `Authorization` header
- **Refresh Token**: 7 days expiry, stored in database, used only when access expires
- **Token Rotation**: Both tokens regenerated during refresh (security feature)
- **Stay Logged In**: Active users (request within 7 days) stay logged in indefinitely

### Events Features
- ✅ Full CRUD operations with ownership checks
- ✅ Pagination (page, limit)
- ✅ Filtering (status: ONGOING/COMPLETED)
- ✅ Sorting (name, dates, createdAt)
- ✅ Search (name and location)
- ✅ File upload (poster images, 5MB limit)
- ✅ Public endpoints for user portal

---

## Project Structure

```
event-system/
├── docker-compose.yml           # Orchestrates all services
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore rules
│
├── backend/                     # NestJS API
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   └── schema.prisma        # Database schema
│   └── src/
│       ├── main.ts
│       ├── auth/                # Authentication module
│       ├── events/              # Events module
│       ├── uploads/             # File upload handling
│       └── common/              # Shared utilities
│
└── frontend/                    # React application
    ├── Dockerfile
    ├── .dockerignore
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts           # Using Vite for fast dev
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── pages/
        │   ├── admin/           # Admin portal pages
        │   └── user/            # User portal pages
        ├── components/          # Reusable components
        ├── services/            # API calls (TanStack Query)
        └── utils/               # Helpers
```

---

## Phase 1: Docker Infrastructure Setup (Day 1)

### 1.1 Docker Compose Configuration
Create the foundation for all services:

**Services:**
- `postgres` - Database (PostgreSQL 16)
- `backend` - NestJS API (Port 3000)
- `frontend` - React app (Port 5173)

**Key Features:**
- Named volumes for data persistence
- Networks for service communication
- Hot-reload for both backend and frontend
- Environment variable management

**docker-compose.yml structure:**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: event-system-db
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: development  # Multi-stage for dev/prod
    container_name: event-system-backend
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      DATABASE_URL: ${DATABASE_URL}
      JWT_SECRET: ${JWT_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
    volumes:
      - ./backend:/app
      - /app/node_modules
      - uploads:/app/uploads  # Persist uploaded files
    ports:
      - "3000:3000"
    command: npm run start:dev

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      target: development
    container_name: event-system-frontend
    depends_on:
      - backend
    environment:
      VITE_API_URL: http://localhost:3000
    volumes:
      - ./frontend:/app
      - /app/node_modules
    ports:
      - "5173:5173"
    command: npm run dev

volumes:
  postgres_data:
  uploads:

networks:
  default:
    name: event-system-network
```

### 1.2 Environment Configuration

**.env file:**
```env
# Database
DB_USER=eventadmin
DB_PASSWORD=securepassword123
DB_NAME=event_system
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Backend
NODE_ENV=development
PORT=3000

# Frontend
VITE_API_URL=http://localhost:3000
```

### 1.3 Dockerfiles

**Backend Dockerfile (Multi-stage):**
```dockerfile
# Development stage
FROM node:20-alpine AS development
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
EXPOSE 3000
CMD ["npm", "run", "start:dev"]

# Production stage
FROM node:20-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/main"]
```

**Frontend Dockerfile (Multi-stage):**
```dockerfile
# Development stage
FROM node:20-alpine AS development
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Deliverable:** Working Docker environment with all services running and communicating.

---

## Phase 2: Database Schema & Backend Foundation (Day 1-2)

### 2.1 Prisma Schema Design

**prisma/schema.prisma:**
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Admin {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String   // bcrypt hashed
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  events        Event[]
  refreshTokens RefreshToken[]

  @@map("admins")
}

model RefreshToken {
  id        String   @id @default(uuid())
  token     String   @unique
  adminId   String
  expiresAt DateTime
  createdAt DateTime @default(now())

  admin Admin @relation(fields: [adminId], references: [id], onDelete: Cascade)

  @@map("refresh_tokens")
}

enum EventStatus {
  ONGOING
  COMPLETED
}

model Event {
  id          String      @id @default(uuid())
  name        String
  startDate   DateTime
  endDate     DateTime
  location    String
  posterUrl   String?     // Path to uploaded poster
  status      EventStatus @default(ONGOING)
  createdById String
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  createdBy Admin @relation(fields: [createdById], references: [id])

  @@index([status])
  @@index([startDate])
  @@index([createdById])
  @@map("events")
}
```

**Migration command (run inside backend container):**
```bash
npx prisma migrate dev --name init
```

### 2.2 Backend Module Structure

**Core Modules:**

1. **AuthModule** (`src/auth/`)
   - `auth.controller.ts` - Login, register, refresh token endpoints
   - `auth.service.ts` - JWT logic, password hashing
   - `jwt.strategy.ts` - Passport JWT strategy
   - `jwt-auth.guard.ts` - Route protection
   - DTOs: `register.dto.ts`, `login.dto.ts`

2. **EventsModule** (`src/events/`)
   - `events.controller.ts` - CRUD endpoints
   - `events.service.ts` - Business logic
   - DTOs: `create-event.dto.ts`, `update-event.dto.ts`, `event-filter.dto.ts`

3. **UploadsModule** (`src/uploads/`)
   - `uploads.controller.ts` - File upload endpoint
   - `uploads.service.ts` - Multer configuration, file validation
   - Serve static files from `/uploads` path

4. **Common** (`src/common/`)
   - `decorators/` - Custom decorators (@CurrentUser)
   - `filters/` - Exception filters
   - `interceptors/` - Transform interceptors
   - `pipes/` - Validation pipes

### 2.3 Key Backend Dependencies

```json
{
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/jwt": "^10.0.0",
    "@nestjs/passport": "^10.0.0",
    "@prisma/client": "^5.0.0",
    "passport": "^0.6.0",
    "passport-jwt": "^4.0.0",
    "bcrypt": "^5.1.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1",
    "multer": "^1.4.5-lts.1"
  },
  "devDependencies": {
    "prisma": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/bcrypt": "^5.0.0",
    "@types/multer": "^1.4.7",
    "@nestjs/testing": "^10.0.0",
    "@types/jest": "^29.5.0",
    "@types/supertest": "^2.0.12",
    "jest": "^29.5.0",
    "supertest": "^6.3.3",
    "ts-jest": "^29.1.0",
    "typescript": "^5.0.0"
  }
}
```

### 2.4 Testing Setup (TDD Foundation)

**Jest Configuration (`jest.config.js`):**
```javascript
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/*.module.ts',
    '!**/*.dto.ts',
    '!**/main.ts',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

**Test Database Setup:**
Create `.env.test` for isolated test database:
```env
DATABASE_URL="postgresql://eventadmin:securepassword123@postgres:5432/event_system_test"
```

**Package.json scripts:**
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  }
}
```

**TDD Workflow for each feature:**
1. Write test file (`.spec.ts`) first
2. Run `npm run test:watch` in separate terminal
3. Watch tests fail (Red)
4. Write minimal implementation (Green)
5. Refactor while keeping tests green (Refactor)
6. Commit when coverage is good

**Deliverable:** Database schema migrated, backend structure ready, testing infrastructure configured.

---

## Phase 3: Authentication System (Day 2) - TDD Approach

### 3.0 TDD Workflow for Auth Module

**Step-by-step TDD process:**

1. **🔴 Write failing tests for AuthService**
   - Test user registration with password hashing
   - Test login with valid credentials
   - Test login with invalid credentials
   - Test refresh token generation
   - Test refresh token validation
   - Test password verification

2. **🟢 Implement AuthService to pass tests**
   - Create minimal implementation
   - Run tests until all pass

3. **🔴 Write failing tests for AuthController**
   - Test POST /auth/register endpoint
   - Test POST /auth/login endpoint
   - Test POST /auth/refresh endpoint
   - Test POST /auth/logout endpoint

4. **🟢 Implement AuthController to pass tests**

5. **🔵 Refactor** - Clean up code, ensure tests still pass

### 3.1 Authentication Flow

**Endpoints:**
- `POST /auth/register` - Admin registration
- `POST /auth/login` - Admin login (returns access + refresh tokens)
- `POST /auth/refresh` - Get new access token using refresh token
- `POST /auth/logout` - Invalidate refresh token

**Features:**
- Password hashing with bcrypt (10 rounds)
- JWT access token (15 min expiry)
- Refresh token (7 day expiry, stored in DB)
- JWT Guard for protected routes
- Custom @CurrentUser() decorator

### 3.2 Test Examples

**auth.service.spec.ts example:**
```typescript
describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('register', () => {
    it('should hash password and create admin', async () => {
      // Test implementation
    });

    it('should throw error if email already exists', async () => {
      // Test implementation
    });
  });

  describe('login', () => {
    it('should return tokens for valid credentials', async () => {
      // Test implementation
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      // Test implementation
    });
  });

  describe('verifyPassword', () => {
    it('should return true for correct password', async () => {
      // Test implementation
    });

    it('should throw error for incorrect password', async () => {
      // Test implementation
    });
  });
});
```

### 3.3 Implementation Details

**Password Confirmation for Delete:**
```typescript
// In events.controller.ts
@Delete(':id')
@UseGuards(JwtAuthGuard)
async deleteEvent(
  @Param('id') id: string,
  @Body() body: { password: string },
  @CurrentUser() user: Admin
) {
  // Verify password before deletion
  await this.authService.verifyPassword(user.id, body.password);
  return this.eventsService.delete(id, user.id);
}
```

**Deliverable:** Complete authentication system with all bonus features.

---

## Phase 4: Events API (Day 3)

### 4.1 Events Endpoints

**Admin Endpoints (Protected):**
- `GET /events` - List with pagination, filter, sort, search
- `GET /events/:id` - Get single event
- `POST /events` - Create event (with poster upload)
- `PATCH /events/:id` - Update event (with poster replacement)
- `DELETE /events/:id` - Delete event (requires password)

**Public Endpoints:**
- `GET /events/public` - List events for user portal
- `GET /events/public/:id` - Get single event details

### 4.2 Query Features

**Pagination:**
```typescript
class EventFilterDto {
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsEnum(['name', 'startDate', 'endDate', 'createdAt'])
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';

  @IsOptional()
  @IsEnum(['ONGOING', 'COMPLETED'])
  status?: EventStatus;

  @IsOptional()
  @IsString()
  search?: string; // Search in name and location
}
```

**Response Format:**
```typescript
{
  data: Event[],
  meta: {
    total: number,
    page: number,
    limit: number,
    totalPages: number
  }
}
```

### 4.3 File Upload

**Configuration:**
- Max file size: 5MB
- Allowed types: image/jpeg, image/png, image/webp
- Storage: Local disk (`/app/uploads` in container, persisted in volume)
- Serve static: `http://localhost:3000/uploads/filename.jpg`

**Multer Setup:**
```typescript
@Post('upload')
@UseInterceptors(FileInterceptor('poster', {
  storage: diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${file.originalname}`;
      cb(null, uniqueName);
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
      cb(null, true);
    } else {
      cb(new BadRequestException('Invalid file type'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }
}))
uploadFile(@UploadedFile() file: Express.Multer.File) {
  return { url: `/uploads/${file.filename}` };
}
```

**Deliverable:** Full CRUD API with pagination, filtering, and file uploads.

---

## Phase 5: Frontend Foundation (Day 3-4)

### 5.1 Frontend Setup

**Tech Stack:**
- Vite (fast dev server with HMR)
- React 18 + TypeScript
- React Router v6
- Material UI v5
- React Hook Form + Yup validation
- TanStack Query v5 (React Query)
- Axios for HTTP

**Key Dependencies:**
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "@mui/material": "^5.15.0",
    "@mui/icons-material": "^5.15.0",
    "@emotion/react": "^11.11.0",
    "@emotion/styled": "^11.11.0",
    "react-hook-form": "^7.49.0",
    "yup": "^1.3.0",
    "@hookform/resolvers": "^3.3.0",
    "@tanstack/react-query": "^5.17.0",
    "axios": "^1.6.0"
  }
}
```

### 5.2 Routing Structure

```typescript
// App.tsx
<BrowserRouter>
  <Routes>
    {/* Public Routes */}
    <Route path="/" element={<UserLayout />}>
      <Route index element={<EventsGallery />} />
      <Route path="events/:id" element={<EventDetails />} />
    </Route>

    {/* Admin Routes */}
    <Route path="/admin" element={<Navigate to="/admin/login" />} />
    <Route path="/admin/login" element={<AdminLogin />} />
    <Route path="/admin/register" element={<AdminRegister />} />
    
    <Route path="/admin/dashboard" element={<ProtectedRoute />}>
      <Route element={<AdminLayout />}>
        <Route index element={<EventsList />} />
        <Route path="events/create" element={<CreateEvent />} />
        <Route path="events/:id/edit" element={<EditEvent />} />
      </Route>
    </Route>

    {/* 404 */}
    <Route path="*" element={<NotFound />} />
  </Routes>
</BrowserRouter>
```

### 5.3 API Service Layer

**Axios Configuration:**
```typescript
// src/services/api.ts
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${baseURL}/auth/refresh`, {
            refreshToken
          });
          localStorage.setItem('access_token', data.accessToken);
          // Retry original request
          return api(error.config);
        } catch {
          // Refresh failed, logout
          localStorage.clear();
          window.location.href = '/admin/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
```

**TanStack Query Setup:**
```typescript
// src/services/events.ts
export const eventsApi = {
  getAll: (filters: EventFilters) => 
    api.get<EventsResponse>('/events', { params: filters }),
  
  getById: (id: string) => 
    api.get<Event>(`/events/${id}`),
  
  create: (data: CreateEventDto) => 
    api.post<Event>('/events', data),
  
  update: (id: string, data: UpdateEventDto) => 
    api.patch<Event>(`/events/${id}`, data),
  
  delete: (id: string, password: string) => 
    api.delete(`/events/${id}`, { data: { password } }),
  
  uploadPoster: (file: File) => {
    const formData = new FormData();
    formData.append('poster', file);
    return api.post<{ url: string }>('/uploads', formData);
  }
};

// React Query hooks
export const useEvents = (filters: EventFilters) => {
  return useQuery({
    queryKey: ['events', filters],
    queryFn: () => eventsApi.getAll(filters).then(res => res.data)
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: eventsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    }
  });
};
```

**Deliverable:** Frontend foundation with routing, API layer, and auth flow.

---

## Phase 6: Admin Portal (Day 4-5)

### 6.1 Admin Components

**1. Login/Register Pages**
- React Hook Form with Yup validation
- Email format validation
- Password strength requirements (min 8 chars)
- Error handling with Material UI Snackbar
- Redirect to dashboard on success

**2. Events List (Table View)**
```typescript
// Features:
- DataGrid with MUI Table
- Pagination controls
- Search bar (debounced)
- Status filter dropdown
- Sort by columns (name, dates)
- Action buttons: Edit, Delete
- Create new event button
```

**3. Create/Edit Event Form**
```typescript
// Fields:
- Name (required, max 200 chars)
- Start Date (required, DatePicker)
- End Date (required, must be after start date)
- Location (required, max 300 chars)
- Poster upload (drag-drop or click)
- Status toggle (Ongoing/Completed) - edit only
- Submit button with loading state

// Validation:
const eventSchema = yup.object({
  name: yup.string().required().max(200),
  startDate: yup.date().required(),
  endDate: yup.date()
    .required()
    .min(yup.ref('startDate'), 'End date must be after start date'),
  location: yup.string().required().max(300),
  poster: yup.mixed().required('Poster is required')
});
```

**4. Delete Confirmation Dialog**
```typescript
// Two-step process:
1. Confirm deletion modal
2. Password input field
3. Submit and verify password via API
4. Show success/error message
```

### 6.2 Responsive Design

**Breakpoints:**
- Mobile: < 600px (stacked layout)
- Tablet: 600-900px (simplified table)
- Desktop: > 900px (full table)

**Material UI Approach:**
```typescript
import { useMediaQuery, useTheme } from '@mui/material';

const theme = useTheme();
const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

// Conditionally render components
{isMobile ? <MobileEventCard /> : <DesktopTableRow />}
```

**Deliverable:** Fully functional admin portal with all CRUD operations.

---

## Phase 7: User Portal (Day 5)

### 7.1 User Components

**1. Events Gallery**
```typescript
// Features:
- Grid layout (responsive: 1/2/3 columns)
- Event cards with poster thumbnails
- Event name, date range, location
- Status badge (Ongoing/Completed)
- Click to view details
- Skeleton loading state
- Empty state if no events

// MUI Grid:
<Grid container spacing={3}>
  {events.map(event => (
    <Grid item xs={12} sm={6} md={4} key={event.id}>
      <EventCard event={event} />
    </Grid>
  ))}
</Grid>
```

**2. Event Details Page**
```typescript
// Display:
- Full-size poster image
- Event name (h1)
- Date range with calendar icon
- Location with pin icon
- Status chip
- Back button
- Responsive layout (image top on mobile, side-by-side on desktop)
```

### 7.2 Public API Integration

```typescript
// src/services/publicEvents.ts
export const publicEventsApi = {
  getAll: () => api.get<Event[]>('/events/public'),
  getById: (id: string) => api.get<Event>(`/events/public/${id}`)
};

export const usePublicEvents = () => {
  return useQuery({
    queryKey: ['public-events'],
    queryFn: () => publicEventsApi.getAll().then(res => res.data)
  });
};
```

**Deliverable:** User-facing portal with gallery and details views.

---

## Phase 8: Polish & Testing (Day 6)

### 8.1 Error Handling

**Backend:**
- Global exception filter
- Validation error formatting
- File upload error messages
- Database constraint errors

**Frontend:**
- TanStack Query error states
- Toast notifications for errors
- Form validation messages
- Network error handling

### 8.2 Loading States

**Frontend:**
- Skeleton loaders for lists
- Button loading spinners
- Page-level loading indicators
- Optimistic updates

### 8.3 Testing Checklist

**Manual Testing:**
- [ ] Admin registration & login
- [ ] Token refresh mechanism
- [ ] Create event with poster upload
- [ ] Edit event (change poster, toggle status)
- [ ] Delete event (password confirmation)
- [ ] Pagination works correctly
- [ ] Search filters events
- [ ] Status filter works
- [ ] Sorting works
- [ ] User portal displays events
- [ ] Event details page works
- [ ] Responsive design on mobile
- [ ] All validation works
- [ ] Error messages display correctly

**Docker Testing:**
- [ ] `docker-compose up` starts all services
- [ ] Hot reload works for backend
- [ ] Hot reload works for frontend
- [ ] Database persists data after restart
- [ ] Uploaded files persist after restart
- [ ] Environment variables load correctly

### 8.4 Documentation

**README.md:**
```markdown
# Event Management System

## Quick Start

1. Clone repository
2. Copy `.env.example` to `.env`
3. Run `docker-compose up --build`
4. Access:
   - User Portal: http://localhost:5173
   - Admin Portal: http://localhost:5173/admin
   - API: http://localhost:3000

## First Time Setup

Register an admin account at `/admin/register`

## Development

- Backend hot reload: enabled
- Frontend hot reload: enabled
- Database: PostgreSQL on port 5432

## Production Build

```bash
docker-compose -f docker-compose.prod.yml up --build
```

## Tech Stack
[List all technologies]
```

**Deliverable:** Polished, tested, documented application.

---

## Implementation Order Summary

### Week 1 Timeline

**Day 1:**
- Morning: Docker setup (Phase 1)
- Afternoon: Database schema + backend foundation (Phase 2)

**Day 2:**
- Morning: Complete authentication system (Phase 3)
- Afternoon: Start Events API (Phase 4)

**Day 3:**
- Morning: Complete Events API with file uploads
- Afternoon: Frontend foundation + routing (Phase 5)

**Day 4:**
- Full day: Admin portal implementation (Phase 6)

**Day 5:**
- Morning: User portal (Phase 7)
- Afternoon: Polish and testing (Phase 8)

**Day 6:**
- Buffer day for fixes, documentation, final testing

---

## Key Architectural Decisions

### 1. Why Docker-First?
- Consistent development environment
- Easy onboarding (single command startup)
- Production-ready from day one
- No "works on my machine" issues

### 2. Why Vite over Create React App?
- Faster dev server (HMR in milliseconds)
- Better Docker hot-reload experience
- Modern tooling (ESM, esbuild)

### 3. Why TanStack Query?
- Built-in caching (reduces API calls)
- Automatic background refetching
- Optimistic updates
- Loading/error states handled

### 4. Why Multer for File Uploads?
- Native NestJS integration
- Easy validation
- Works well with Docker volumes

### 5. Why Local File Storage?
- Simple to implement
- No external dependencies
- Easy to migrate to S3 later if needed
- Good for MVP/assessment

### 6. Avoiding Over-Engineering
- No microservices (monolithic is fine)
- No Redis (JWT + DB refresh tokens sufficient)
- No separate file service (Multer is enough)
- No complex state management (React Query handles it)
- No GraphQL (REST is simpler for this scope)
- No WebSockets (not needed for this use case)

---

## Production Deployment Considerations

### docker-compose.prod.yml
```yaml
version: '3.8'

services:
  postgres:
    # Same as dev but with stronger password
    
  backend:
    build:
      target: production  # Use production stage
    restart: always
    # Remove volume mounts
    
  frontend:
    build:
      target: production  # Nginx serving static files
    restart: always
    # Remove volume mounts

  nginx:  # Optional reverse proxy
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
```

### Environment Variables (Production)
- Use strong random secrets
- Store in secrets management (not .env file)
- Enable CORS only for specific domains
- Set NODE_ENV=production

### Security Checklist
- [ ] Change all default passwords
- [ ] Use strong JWT secrets (32+ chars random)
- [ ] Enable HTTPS (SSL certificates)
- [ ] Configure CORS properly
- [ ] Rate limiting on auth endpoints
- [ ] File upload size limits enforced
- [ ] SQL injection prevention (Prisma handles this)
- [ ] XSS prevention (React handles this)
- [ ] CSRF protection for state-changing operations

---

## Common Pitfalls to Avoid

1. **Docker Issues:**
   - Don't forget `.dockerignore` (exclude node_modules)
   - Use named volumes for persistence
   - Wait for DB health check before starting backend

2. **Authentication:**
   - Store tokens in localStorage (not cookies for simplicity)
   - Handle token refresh before expiry
   - Clear tokens on logout

3. **File Uploads:**
   - Validate file types on both frontend and backend
   - Set size limits
   - Use unique filenames to avoid conflicts

4. **Pagination:**
   - Always validate page/limit params
   - Return total count for UI
   - Handle empty results gracefully

5. **Date Handling:**
   - Use ISO strings for API communication
   - Handle timezone conversions properly
   - Validate end date > start date

6. **Responsive Design:**
   - Test on actual mobile devices
   - Use Material UI breakpoints consistently
   - Consider touch targets for mobile

---

## Success Criteria

### Minimum Requirements
- [x] TypeScript + React + Material UI
- [x] React Hook Form with validation
- [x] TanStack Query for data fetching
- [x] TypeScript + NestJS backend
- [x] Prisma + PostgreSQL
- [x] JWT authentication with AuthGuard
- [x] Password encryption
- [x] Complete dockerization
- [x] Admin CRUD operations
- [x] User portal with event display
- [x] Password confirmation for delete

### Bonus Features
- [x] class-validator for backend validation
- [x] Refresh token mechanism
- [x] Pagination
- [x] Responsive design
- [x] Filtering and sorting
- [x] File upload for posters

### Code Quality
- Clean, readable code
- Proper TypeScript typing
- Component reusability
- Separation of concerns
- Error handling
- Loading states

---

## Conclusion

This plan prioritizes:
1. **Docker-first approach** - Infrastructure before code
2. **Simplicity** - No unnecessary complexity
3. **Completeness** - All requirements covered
4. **Maintainability** - Clean architecture
5. **Practicality** - Easy to understand and extend

Follow the phases sequentially, test as you build, and you'll have a production-ready application in 5-6 days.
