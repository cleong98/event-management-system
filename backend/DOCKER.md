# Docker Setup for Event Management System Backend

## Overview

The backend application is fully containerized using Docker and Docker Compose, making it easy to run the entire stack (backend + database) with a single command.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)

### Installing Docker

**macOS:**
```bash
# Download Docker Desktop from:
https://www.docker.com/products/docker-desktop

# Or install via Homebrew:
brew install --cask docker
```

**Linux:**
```bash
# Install Docker Engine:
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose:
sudo apt-get install docker-compose-plugin
```

**Windows:**
Download Docker Desktop from: https://www.docker.com/products/docker-desktop

## Quick Start

### 1. Start the Application

```bash
# Start all services (database + backend)
docker-compose up -d

# View logs
docker-compose logs -f
```

The application will be available at:
- **Backend API**: http://localhost:3000
- **Swagger Documentation**: http://localhost:3000/api
- **PostgreSQL**: localhost:5433

### 2. Stop the Application

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (clears database)
docker-compose down -v
```

## Docker Compose Configuration

### Services

**1. PostgreSQL Database (`postgres`)**
- Image: `postgres:16-alpine`
- Port: `5433:5432` (host:container)
- Database: `event_system`
- User: `eventadmin`
- Password: `securepassword123`
- Health check enabled
- Persistent volume: `postgres_data`

**2. Backend API (`backend`)**
- Build: Multi-stage Dockerfile
- Target: `development` (for dev) or `production` (for prod)
- Port: `3000:3000`
- Auto-restart: `unless-stopped`
- Hot-reload enabled (development mode)
- Automatic Prisma migrations on startup

### Environment Variables

The docker-compose.yml includes all necessary environment variables:

```yaml
NODE_ENV: development
PORT: 3000
DATABASE_URL: postgresql://eventadmin:securepassword123@postgres:5432/event_system
JWT_SECRET: your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_REFRESH_SECRET: your-refresh-secret-key-change-in-production-min-32-chars
JWT_EXPIRATION: 15m
JWT_REFRESH_EXPIRATION: 7d
```

## Development Workflow

### Starting Development

```bash
# Build and start services
docker-compose up --build

# Or in detached mode
docker-compose up -d --build

# View logs
docker-compose logs -f backend
```

### Code Changes

The development container includes hot-reload:
1. Edit code locally
2. Changes are synced via volume mount
3. Application automatically restarts
4. No need to rebuild container

### Database Migrations

Migrations run automatically when the container starts:

```bash
# If you need to run migrations manually:
docker-compose exec backend npx prisma migrate dev

# Generate Prisma Client:
docker-compose exec backend npx prisma generate

# Open Prisma Studio:
docker-compose exec backend npx prisma studio
```

### Accessing Container Shell

```bash
# Backend container shell
docker-compose exec backend sh

# PostgreSQL shell
docker-compose exec postgres psql -U eventadmin -d event_system
```

### Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f postgres

# Last 100 lines
docker-compose logs --tail=100 backend
```

## Production Deployment

### Building for Production

```bash
# Build production image
docker build --target production -t event-system-backend:prod .

# Run production container
docker run -d \
  --name backend-prod \
  -p 3000:3000 \
  -e DATABASE_URL="your-prod-db-url" \
  -e JWT_SECRET="your-prod-secret" \
  event-system-backend:prod
```

### Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - event-network

  backend:
    build:
      context: .
      target: production
    restart: always
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}
      JWT_SECRET: ${JWT_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
    ports:
      - "3000:3000"
    depends_on:
      - postgres
    networks:
      - event-network

volumes:
  postgres_data:

networks:
  event-network:
```

Run with:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Dockerfile Stages

### Development Stage
- Based on `node:20-alpine`
- Installs all dependencies
- Includes dev dependencies
- Enables hot-reload with volume mounts
- Runs `npm run start:dev`

### Builder Stage
- Based on `node:20-alpine`
- Installs dependencies
- Generates Prisma Client
- Builds TypeScript application
- Creates optimized production build

### Production Stage
- Based on `node:20-alpine`
- Production dependencies only
- Copies built application from builder
- Runs as non-root user (`node`)
- Includes health check
- Runs `node dist/main`

## Common Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart a service
docker-compose restart backend

# Rebuild and start
docker-compose up -d --build

# View running containers
docker-compose ps

# Check service health
docker-compose ps
docker inspect event-system-backend

# Remove all containers and volumes
docker-compose down -v

# View resource usage
docker stats

# Prune unused resources
docker system prune -a
```

## Troubleshooting

### Issue: Docker daemon not running
**Solution:**
- Start Docker Desktop application
- Or start Docker service: `sudo systemctl start docker` (Linux)

### Issue: Port already in use
**Solution:**
```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
lsof -ti:3000 | xargs kill -9

# Or change port in docker-compose.yml
ports:
  - "3001:3000"  # Use port 3001 instead
```

### Issue: Database connection failed
**Solution:**
```bash
# Check if postgres container is running
docker-compose ps postgres

# Check postgres logs
docker-compose logs postgres

# Restart postgres
docker-compose restart postgres

# Wait for health check
docker-compose ps postgres  # Should show "healthy"
```

### Issue: Prisma migrations not running
**Solution:**
```bash
# Run migrations manually
docker-compose exec backend npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
docker-compose exec backend npx prisma migrate reset
```

### Issue: Changes not reflected (hot-reload not working)
**Solution:**
```bash
# Rebuild container
docker-compose up -d --build

# Check volume mounts
docker-compose exec backend ls -la /app

# Restart backend service
docker-compose restart backend
```

### Issue: Out of disk space
**Solution:**
```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Clean everything
docker system prune -a --volumes
```

## Volume Management

### Persistent Data

The `postgres_data` volume persists database data:

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect backend_postgres_data

# Backup database
docker-compose exec postgres pg_dump -U eventadmin event_system > backup.sql

# Restore database
docker-compose exec -T postgres psql -U eventadmin event_system < backup.sql
```

### Uploads Directory

The `uploads/` directory is mounted as a volume:
- Local: `./uploads`
- Container: `/app/uploads`
- Persists uploaded files between container restarts

## Networking

Containers communicate via the `event-network` bridge network:

```bash
# List networks
docker network ls

# Inspect network
docker network inspect backend_event-network

# Backend connects to postgres using hostname "postgres"
# Database URL: postgresql://user:pass@postgres:5432/db
```

## Health Checks

### Backend Health Check
```bash
curl http://localhost:3000/
# Should return: "Hello World!"
```

### PostgreSQL Health Check
```bash
docker-compose exec postgres pg_isready -U eventadmin -d event_system
```

### Check All Services
```bash
docker-compose ps
# All services should show "healthy" or "running"
```

## Performance Optimization

### Build Cache
```bash
# Use BuildKit for faster builds
DOCKER_BUILDKIT=1 docker-compose build

# No cache build (clean build)
docker-compose build --no-cache
```

### Resource Limits

Add to `docker-compose.yml`:
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          memory: 512M
```

## Security Best Practices

1. ✅ **Non-root user**: Containers run as `node` user
2. ✅ **Health checks**: Automatic health monitoring
3. ✅ **Signal handling**: Uses `dumb-init` for proper process signals
4. ✅ **Minimal image**: Based on Alpine Linux
5. ✅ **Multi-stage build**: Smaller production images
6. ✅ **Environment variables**: Secrets via environment (not hardcoded)
7. ⚠️ **Change default passwords** before production deployment

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Docker Build

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build Docker image
        run: docker build -t event-system-backend:${{ github.sha }} .

      - name: Run tests
        run: docker-compose up -d && docker-compose exec -T backend npm test
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [NestJS Docker Guide](https://docs.nestjs.com/recipes/docker)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)
