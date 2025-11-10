# Swagger API Documentation

## Overview

The Event Management System API now includes comprehensive Swagger/OpenAPI documentation for all endpoints. This documentation is automatically generated from NestJS decorators and provides an interactive interface to explore and test the API.

## Accessing Swagger Documentation

Once the server is running, access the Swagger UI at:

```
http://localhost:3000/api
```

The Swagger JSON specification is available at:

```
http://localhost:3000/api-json
```

## Features

### Interactive API Documentation

- **Interactive Testing**: Try out API endpoints directly from the browser
- **Request/Response Schemas**: See detailed schemas for all request and response types
- **Authentication**: Built-in JWT authentication support with Bearer token input
- **Examples**: All endpoints include example requests and responses
- **Validation Rules**: DTOs display validation requirements (required fields, formats, lengths)

### API Organization

The API is organized into three main tags:

1. **auth** - Authentication endpoints (register, login, logout, refresh)
2. **events** - Event management endpoints (CRUD operations with filters)
3. **uploads** - File upload endpoints (image uploads)

## Documented Endpoints

### Authentication (`/auth`)

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/auth/register` | POST | Register a new user | No |
| `/auth/login` | POST | Login and get tokens | No |
| `/auth/refresh` | POST | Refresh access token | No |
| `/auth/logout` | POST | Logout and invalidate refresh token | No |

**Request Examples:**

```json
// Register
{
  "email": "user@example.com",
  "password": "Password123!"
}

// Login
{
  "email": "user@example.com",
  "password": "Password123!"
}

// Refresh
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Events (`/events`)

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/events` | POST | Create new event | Yes |
| `/events` | GET | Get all events with filters | Yes |
| `/events/public` | GET | Get all public events | No |
| `/events/public/:id` | GET | Get single public event | No |
| `/events/:id` | GET | Get single event | Yes |
| `/events/:id` | PATCH | Update event | Yes |
| `/events/:id` | DELETE | Delete event | Yes |

**Filter Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `sortBy` - Field to sort by (name, startDate, endDate, createdAt)
- `sortOrder` - Sort direction (asc, desc)
- `status` - Filter by status (ONGOING, COMPLETED)
- `search` - Search in name and location

**Request Examples:**

```json
// Create Event
{
  "name": "Tech Conference 2024",
  "startDate": "2024-12-01T09:00:00Z",
  "endDate": "2024-12-01T17:00:00Z",
  "location": "San Francisco Convention Center",
  "posterUrl": "https://example.com/posters/tech-conf-2024.jpg"
}

// Update Event
{
  "name": "Updated Conference Name",
  "status": "ONGOING"
}

// Delete Event (requires password)
{
  "password": "Password123!"
}
```

### Uploads (`/uploads`)

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/uploads` | POST | Upload image file | No |

**Supported Formats:**
- JPEG (.jpg, .jpeg)
- PNG (.png)
- WEBP (.webp)

**File Size Limit:** 5MB

**Response:**

```json
{
  "url": "/uploads/file-1699612345678-123456789.jpg",
  "filename": "file-1699612345678-123456789.jpg",
  "mimetype": "image/jpeg",
  "size": 1048576
}
```

## Using Bearer Authentication in Swagger

1. **Login**: Use the `/auth/login` endpoint to get an access token
2. **Authorize**: Click the "Authorize" button at the top of Swagger UI
3. **Enter Token**: Paste your access token (without "Bearer" prefix)
4. **Test**: Now you can test authenticated endpoints

### Example Flow:

```bash
# 1. Register a user
POST /auth/register
{
  "email": "test@example.com",
  "password": "Password123!"
}

# 2. Login
POST /auth/login
{
  "email": "test@example.com",
  "password": "Password123!"
}

# Response includes accessToken
{
  "id": 1,
  "email": "test@example.com",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

# 3. Click "Authorize" button and paste the accessToken

# 4. Now you can call protected endpoints like:
POST /events
GET /events
etc.
```

## DTOs and Validation

All request DTOs include validation decorators that are reflected in the Swagger documentation:

### Validation Rules Documented:

- **Email fields**: Must be valid email format
- **Password fields**: Minimum 8 characters for registration
- **String fields**: Maximum length constraints
- **Date fields**: ISO 8601 format required
- **URL fields**: Must be valid URLs
- **Enum fields**: Limited to specific values
- **Number fields**: Minimum value constraints

### Example DTO Documentation:

**CreateEventDto:**
```typescript
{
  name: string          // Required, max 200 characters
  startDate: string     // Required, ISO 8601 format
  endDate: string       // Required, ISO 8601 format
  location: string      // Required, max 300 characters
  posterUrl?: string    // Optional, valid URL
}
```

## Response Status Codes

All endpoints document their possible response codes:

### Success Codes:
- `200 OK` - Successful GET, PATCH, DELETE, or login request
- `201 Created` - Successful POST request (register, create event, upload)

### Client Error Codes:
- `400 Bad Request` - Invalid input data, validation errors
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - User doesn't have permission (not event owner)
- `404 Not Found` - Resource doesn't exist
- `409 Conflict` - Email already exists (registration)
- `413 Payload Too Large` - File exceeds size limit

### Server Error Codes:
- `500 Internal Server Error` - Unexpected server error

## Implementation Details

### Swagger Configuration (main.ts)

```typescript
const config = new DocumentBuilder()
  .setTitle('Event Management System API')
  .setDescription('API documentation for the Event Management System')
  .setVersion('1.0')
  .addTag('auth', 'Authentication endpoints')
  .addTag('events', 'Event management endpoints')
  .addTag('uploads', 'File upload endpoints')
  .addBearerAuth({
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
  }, 'JWT-auth')
  .build();
```

### Decorator Usage

**Controller Level:**
```typescript
@ApiTags('events')
@Controller('events')
```

**Endpoint Level:**
```typescript
@ApiOperation({ summary: 'Create new event' })
@ApiResponse({ status: 201, description: 'Event created' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiBearerAuth('JWT-auth')
```

**DTO Level:**
```typescript
@ApiProperty({
  description: 'Event name',
  example: 'Tech Conference 2024',
  maxLength: 200,
})
```

## Testing with Swagger UI

### Steps to Test the API:

1. **Start the server**:
   ```bash
   npm run start:dev
   ```

2. **Open Swagger UI**:
   ```
   http://localhost:3000/api
   ```

3. **Test Authentication**:
   - Register a new user via `/auth/register`
   - Login via `/auth/login` to get token
   - Click "Authorize" and enter token

4. **Test Event Management**:
   - Create events
   - List events with filters
   - Update and delete events

5. **Test File Upload**:
   - Upload images via `/uploads`
   - Access uploaded files via returned URL

## Benefits

### For Developers:
- ✅ **Self-documenting API**: Code and docs always in sync
- ✅ **Type safety**: TypeScript interfaces match API schemas
- ✅ **Easy testing**: No need for external tools like Postman
- ✅ **Quick debugging**: See exact request/response formats

### For Frontend Developers:
- ✅ **Clear contracts**: Know exactly what data to send/receive
- ✅ **Example data**: See real examples for all endpoints
- ✅ **Validation rules**: Know which fields are required
- ✅ **Error handling**: See all possible error responses

### For API Consumers:
- ✅ **Interactive docs**: Try endpoints without writing code
- ✅ **Always up-to-date**: Docs generated from source code
- ✅ **Comprehensive**: All endpoints, parameters, and responses documented
- ✅ **Standards-based**: OpenAPI 3.0 specification

## Customization

### Adding Documentation to New Endpoints:

```typescript
@Post('new-endpoint')
@ApiOperation({
  summary: 'Short description',
  description: 'Detailed description'
})
@ApiResponse({
  status: 201,
  description: 'Success description',
  type: ResponseDto,  // or schema object
})
@ApiResponse({
  status: 400,
  description: 'Error description'
})
async newEndpoint(@Body() dto: CreateDto) {
  // implementation
}
```

### Adding Documentation to DTOs:

```typescript
export class MyDto {
  @ApiProperty({
    description: 'Field description',
    example: 'example value',
    required: true,
  })
  @IsString()
  myField: string;
}
```

## OpenAPI Specification Export

The OpenAPI specification can be exported as JSON for use with other tools:

```bash
# Access the JSON specification
curl http://localhost:3000/api-json > openapi.json
```

This can be used with:
- Code generators
- Mock servers
- API testing tools
- Documentation generators

## Troubleshooting

**Issue**: Swagger UI not loading
- **Solution**: Ensure server is running on port 3000
- **Solution**: Check browser console for errors
- **Solution**: Verify `@nestjs/swagger` is installed

**Issue**: DTOs not showing in Swagger
- **Solution**: Add `@ApiProperty()` decorators to all DTO fields
- **Solution**: Ensure DTO is used in `@Body()` or `@Query()` decorator

**Issue**: Authentication not working
- **Solution**: Click "Authorize" and enter valid JWT token
- **Solution**: Token should be entered without "Bearer" prefix
- **Solution**: Ensure token hasn't expired

## References

- [NestJS Swagger Documentation](https://docs.nestjs.com/openapi/introduction)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)
