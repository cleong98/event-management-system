# Upload Module Documentation

## Overview

The Upload Module provides file upload functionality for the event management system, specifically designed for image uploads (JPEG, PNG, WEBP).

## Features

- ✅ Image file uploads (JPEG, PNG, WEBP)
- ✅ File size validation (5MB limit)
- ✅ File type validation via MIME type checking
- ✅ Automatic unique filename generation
- ✅ Direct URL access to uploaded files
- ✅ Comprehensive test coverage (TDD approach)

## API Endpoint

### POST /uploads

Upload an image file to the server.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Form field name: `file`

**Accepted file types:**
- `image/jpeg`
- `image/jpg`
- `image/png`
- `image/webp`

**File size limit:** 5MB

**Response (201 Created):**
```json
{
  "url": "/uploads/file-1699612345678-123456789.jpg",
  "filename": "file-1699612345678-123456789.jpg",
  "mimetype": "image/jpeg",
  "size": 1048576
}
```

**Error Responses:**

400 Bad Request - No file uploaded:
```json
{
  "statusCode": 400,
  "message": "No file uploaded",
  "error": "Bad Request"
}
```

400 Bad Request - Invalid file type:
```json
{
  "statusCode": 400,
  "message": "Invalid file type. Only JPEG, PNG, and WEBP images are allowed.",
  "error": "Bad Request"
}
```

413 Payload Too Large - File exceeds size limit:
```json
{
  "statusCode": 413,
  "message": "File too large",
  "error": "Payload Too Large"
}
```

## Usage Examples

### Using cURL

```bash
# Upload an image
curl -X POST \
  -F "file=@/path/to/image.jpg" \
  http://localhost:3000/uploads

# Response will include URL to access the file
# Access the uploaded file
curl http://localhost:3000/uploads/file-1699612345678-123456789.jpg
```

### Using JavaScript/Fetch

```javascript
// Upload file
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('http://localhost:3000/uploads', {
  method: 'POST',
  body: formData
});

const data = await response.json();
console.log('Uploaded file URL:', data.url);

// Access the file
const imageUrl = `http://localhost:3000${data.url}`;
```

### Using Axios

```javascript
import axios from 'axios';

const formData = new FormData();
formData.append('file', file);

const response = await axios.post('http://localhost:3000/uploads', formData, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});

console.log('File uploaded:', response.data);
```

## File Storage

- **Location:** `uploads/` directory in project root
- **Naming convention:** `file-{timestamp}-{random}.{extension}`
- **Served at:** `/uploads/{filename}`

## Testing

### Unit Tests

```bash
# Run upload module unit tests
npm test -- uploads

# Coverage includes:
# - UploadsService: File validation and URL generation
# - UploadsController: Upload handling and error cases
```

### E2E Tests

```bash
# Run end-to-end tests
npm run test:e2e

# Tests include:
# - File upload workflow
# - File validation (type and size)
# - Response structure
# - File storage verification
# - Concurrent uploads
```

### Manual Testing

A manual test script is provided to verify the complete workflow:

```bash
# Start the server first
npm run start:dev

# In another terminal, run the test script
./test-upload-manual.sh
```

## Implementation Details

### Module Structure

```
src/uploads/
├── uploads.module.ts       # Module definition
├── uploads.controller.ts   # HTTP endpoints
├── uploads.service.ts      # Business logic
├── uploads.controller.spec.ts  # Controller tests
├── uploads.service.spec.ts     # Service tests
└── README.md              # This file
```

### Key Components

**UploadsController:**
- Handles POST /uploads endpoint
- Uses Multer for file upload processing
- Configures file storage with diskStorage
- Implements file filtering and size limits

**UploadsService:**
- Validates uploaded files
- Generates accessible file URLs
- Provides reusable validation logic

**ServeStaticModule:**
- Configured in AppModule
- Serves files from `/uploads` route
- Maps to `uploads/` directory

### TDD Approach

This module was developed following Test-Driven Development:

1. ✅ **Tests First:** Wrote comprehensive unit and e2e tests before implementation
2. ✅ **Red-Green-Refactor:** Tests failed initially, then implementation made them pass
3. ✅ **Coverage:** 100% coverage for service and controller logic
4. ✅ **Edge Cases:** Tests cover success cases, validation failures, and error conditions

### Test Statistics

- **Unit Tests:** 22 tests (Service: 12, Controller: 10)
- **E2E Tests:** 15 tests covering upload workflow and file storage
- **Total Coverage:** All critical paths tested

## Configuration

### File Size Limit

To change the file size limit, update both locations:

**uploads.controller.ts:**
```typescript
limits: {
  fileSize: 5 * 1024 * 1024, // 5MB
}
```

**uploads.service.ts:**
```typescript
const maxSize = 5 * 1024 * 1024; // 5MB
```

### Allowed File Types

**uploads.controller.ts and uploads.service.ts:**
```typescript
const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
```

### Storage Location

**app.module.ts:**
```typescript
ServeStaticModule.forRoot({
  rootPath: join(process.cwd(), 'uploads'),
  serveRoot: '/uploads',
})
```

**uploads.controller.ts:**
```typescript
storage: diskStorage({
  destination: join(process.cwd(), 'uploads'),
  // ...
})
```

## Security Considerations

1. **File Type Validation:** Only allowed MIME types are accepted
2. **File Size Limits:** Prevents DoS attacks via large file uploads
3. **Filename Sanitization:** Server generates unique, safe filenames
4. **No Arbitrary Code Execution:** Files are stored as-is, not executed

## Future Enhancements

Potential improvements:
- Image compression/optimization
- Multiple file upload support
- Cloud storage integration (S3, Google Cloud Storage)
- Image resizing/thumbnail generation
- File deletion endpoint
- Upload progress tracking
- Virus scanning integration

## Troubleshooting

**Issue:** "No file uploaded" error
- **Solution:** Ensure form field name is `file`
- **Solution:** Check Content-Type is `multipart/form-data`

**Issue:** "Invalid file type" error
- **Solution:** Verify file MIME type is JPEG, PNG, or WEBP
- **Solution:** Check file extension matches content type

**Issue:** "Payload Too Large" error
- **Solution:** Reduce file size to under 5MB
- **Solution:** Compress the image before uploading

**Issue:** Cannot access uploaded files
- **Solution:** Ensure server is running
- **Solution:** Verify ServeStaticModule is configured in AppModule
- **Solution:** Check `uploads/` directory exists and has correct permissions
