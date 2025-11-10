# Docker Quick Start Guide

## Prerequisites

1. **Install Docker Desktop**
   - macOS/Windows: Download from https://www.docker.com/products/docker-desktop
   - Linux: `curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh`

2. **Start Docker Desktop**
   - Ensure Docker Desktop is running (check system tray/menu bar)

## Start the Backend

```bash
# 1. Navigate to backend directory
cd /path/to/event-system/backend

# 2. Start all services (database + backend)
docker-compose up -d

# 3. Check if services are running
docker-compose ps
```

Expected output:
```
NAME                      STATUS          PORTS
event-system-backend      Up 30 seconds   0.0.0.0:3000->3000/tcp
event-system-db           Up 30 seconds   0.0.0.0:5433->5432/tcp
```

## Access the Application

- **API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api
- **Database**: postgresql://eventadmin:securepassword123@localhost:5433/event_system

## View Logs

```bash
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Database only
docker-compose logs -f postgres
```

## Stop the Application

```bash
# Stop services (keeps data)
docker-compose down

# Stop and remove all data
docker-compose down -v
```

## Rebuild After Code Changes

```bash
# Rebuild and restart
docker-compose up -d --build
```

## Common Issues

### Docker daemon not running
**Solution**: Start Docker Desktop application

### Port 3000 already in use
**Solution**:
```bash
lsof -ti:3000 | xargs kill -9
docker-compose up -d
```

### Database connection failed
**Solution**:
```bash
docker-compose restart postgres
docker-compose logs postgres
```

## Next Steps

- Read full documentation: [DOCKER.md](./DOCKER.md)
- Test API: http://localhost:3000/api
- Check database: `docker-compose exec postgres psql -U eventadmin -d event_system`

## That's It!

Your backend is now running in Docker with:
- ✅ PostgreSQL database
- ✅ NestJS backend API
- ✅ Automatic migrations
- ✅ Hot-reload for development
- ✅ Swagger API documentation
