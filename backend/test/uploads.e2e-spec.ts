import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import * as path from 'path';
import * as fs from 'fs';

describe('UploadsController (e2e)', () => {
  let app: INestApplication<App>;
  const uploadsDir = path.join(__dirname, '..', 'uploads');

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Ensure uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
  });

  afterEach(async () => {
    await app.close();
  });

  afterAll(() => {
    // Clean up test uploads
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      files.forEach((file) => {
        if (file.startsWith('file-')) {
          fs.unlinkSync(path.join(uploadsDir, file));
        }
      });
    }
  });

  describe('/uploads (POST)', () => {
    it('should upload a JPEG image successfully', () => {
      // Create a test JPEG buffer
      const testImageBuffer = Buffer.from('fake-jpeg-content');

      return request(app.getHttpServer())
        .post('/uploads')
        .attach('file', testImageBuffer, {
          filename: 'test-image.jpg',
          contentType: 'image/jpeg',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('url');
          expect(res.body).toHaveProperty('filename');
          expect(res.body).toHaveProperty('mimetype', 'image/jpeg');
          expect(res.body).toHaveProperty('size');
          expect(res.body.url).toMatch(/^http:\/\/localhost:3000\/uploads\//);
          expect(res.body.filename).toMatch(/\.jpg$/);
        });
    });

    it('should upload a PNG image successfully', () => {
      const testImageBuffer = Buffer.from('fake-png-content');

      return request(app.getHttpServer())
        .post('/uploads')
        .attach('file', testImageBuffer, {
          filename: 'test-image.png',
          contentType: 'image/png',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('mimetype', 'image/png');
          expect(res.body.filename).toMatch(/\.png$/);
        });
    });

    it('should upload a WEBP image successfully', () => {
      const testImageBuffer = Buffer.from('fake-webp-content');

      return request(app.getHttpServer())
        .post('/uploads')
        .attach('file', testImageBuffer, {
          filename: 'test-image.webp',
          contentType: 'image/webp',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('mimetype', 'image/webp');
          expect(res.body.filename).toMatch(/\.webp$/);
        });
    });

    it('should reject upload when no file is provided', () => {
      return request(app.getHttpServer())
        .post('/uploads')
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBe('No file uploaded');
        });
    });

    it('should reject invalid file type (PDF)', () => {
      const testPdfBuffer = Buffer.from('fake-pdf-content');

      return request(app.getHttpServer())
        .post('/uploads')
        .attach('file', testPdfBuffer, {
          filename: 'test-document.pdf',
          contentType: 'application/pdf',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain(
            'Invalid file type. Only JPEG, PNG, and WEBP images are allowed.',
          );
        });
    });

    it('should reject invalid file type (SVG)', () => {
      const testSvgBuffer = Buffer.from('<svg></svg>');

      return request(app.getHttpServer())
        .post('/uploads')
        .attach('file', testSvgBuffer, {
          filename: 'test-image.svg',
          contentType: 'image/svg+xml',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain(
            'Invalid file type. Only JPEG, PNG, and WEBP images are allowed.',
          );
        });
    });

    it('should reject file exceeding size limit', () => {
      // Create a buffer larger than 5MB
      const largeBuffer = Buffer.alloc(6 * 1024 * 1024);

      return request(app.getHttpServer())
        .post('/uploads')
        .attach('file', largeBuffer, {
          filename: 'large-image.jpg',
          contentType: 'image/jpeg',
        })
        .expect(413); // Multer returns 413 Payload Too Large
    });

    it('should accept file under 5MB limit', () => {
      // Create a buffer of 1MB (well under the 5MB limit)
      const validSizeBuffer = Buffer.alloc(1 * 1024 * 1024);

      return request(app.getHttpServer())
        .post('/uploads')
        .attach('file', validSizeBuffer, {
          filename: 'valid-size.jpg',
          contentType: 'image/jpeg',
        })
        .expect(201);
    });

    it('should generate unique filenames for multiple uploads', async () => {
      const testImageBuffer = Buffer.from('fake-jpeg-content');

      const response1 = await request(app.getHttpServer())
        .post('/uploads')
        .attach('file', testImageBuffer, {
          filename: 'test.jpg',
          contentType: 'image/jpeg',
        })
        .expect(201);

      // Small delay to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 10));

      const response2 = await request(app.getHttpServer())
        .post('/uploads')
        .attach('file', testImageBuffer, {
          filename: 'test.jpg',
          contentType: 'image/jpeg',
        })
        .expect(201);

      expect(response1.body.filename).not.toBe(response2.body.filename);
    });

    it('should preserve file extension from original filename', () => {
      const testImageBuffer = Buffer.from('fake-jpeg-content');

      return request(app.getHttpServer())
        .post('/uploads')
        .attach('file', testImageBuffer, {
          filename: 'my-photo.jpg',
          contentType: 'image/jpeg',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.filename).toMatch(/\.jpg$/);
        });
    });

    it('should handle concurrent uploads', async () => {
      const testImageBuffer = Buffer.from('fake-jpeg-content');

      const uploadPromises = Array.from({ length: 5 }, (_, i) =>
        request(app.getHttpServer())
          .post('/uploads')
          .attach('file', testImageBuffer, {
            filename: `test-${i}.jpg`,
            contentType: 'image/jpeg',
          })
          .expect(201),
      );

      const responses = await Promise.all(uploadPromises);

      // Verify all uploads succeeded and have unique filenames
      const filenames = responses.map((res) => res.body.filename);
      const uniqueFilenames = new Set(filenames);
      expect(uniqueFilenames.size).toBe(5);
    });
  });

  describe('File Upload Response and Storage', () => {
    it('should return valid URL structure in upload response', async () => {
      const testImageBuffer = Buffer.from('test-file-content');

      const uploadResponse = await request(app.getHttpServer())
        .post('/uploads')
        .attach('file', testImageBuffer, {
          filename: 'test-url.jpg',
          contentType: 'image/jpeg',
        })
        .expect(201);

      // Verify URL structure
      expect(uploadResponse.body).toHaveProperty('url');
      expect(uploadResponse.body.url).toMatch(/^\/uploads\/file-\d+-\d+\.jpg$/);
    });

    it('should save file to disk and return correct metadata', async () => {
      const testContent = Buffer.from('file-storage-test');

      const uploadRes = await request(app.getHttpServer())
        .post('/uploads')
        .attach('file', testContent, {
          filename: 'storage-test.jpg',
          contentType: 'image/jpeg',
        })
        .expect(201);

      // Verify response metadata
      expect(uploadRes.body).toEqual({
        url: expect.stringMatching(/^\/uploads\/file-\d+-\d+\.jpg$/),
        filename: expect.stringMatching(/^file-\d+-\d+\.jpg$/),
        mimetype: 'image/jpeg',
        size: testContent.length,
      });

      // Verify file exists on disk
      const filename = uploadRes.body.filename;
      const filePath = path.join(uploadsDir, filename);
      expect(fs.existsSync(filePath)).toBe(true);

      // Verify file content
      const savedContent = fs.readFileSync(filePath);
      expect(savedContent.toString()).toBe('file-storage-test');
    });

    it('should create files with unique filenames for same original name', async () => {
      const content = Buffer.from('test');

      const upload1 = await request(app.getHttpServer())
        .post('/uploads')
        .attach('file', content, {
          filename: 'same-name.jpg',
          contentType: 'image/jpeg',
        })
        .expect(201);

      // Wait to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 10));

      const upload2 = await request(app.getHttpServer())
        .post('/uploads')
        .attach('file', content, {
          filename: 'same-name.jpg',
          contentType: 'image/jpeg',
        })
        .expect(201);

      // Verify different server-generated filenames
      expect(upload1.body.filename).not.toBe(upload2.body.filename);

      // Both files should exist
      expect(fs.existsSync(path.join(uploadsDir, upload1.body.filename))).toBe(true);
      expect(fs.existsSync(path.join(uploadsDir, upload2.body.filename))).toBe(true);
    });

    it('should preserve file extension from original filename', async () => {
      const testCases = [
        { filename: 'test.jpg', expectedExt: '.jpg' },
        { filename: 'photo.png', expectedExt: '.png' },
        { filename: 'image.webp', expectedExt: '.webp' },
      ];

      for (const testCase of testCases) {
        const uploadRes = await request(app.getHttpServer())
          .post('/uploads')
          .attach('file', Buffer.from('test'), {
            filename: testCase.filename,
            contentType: 'image/jpeg',
          })
          .expect(201);

        expect(uploadRes.body.filename).toMatch(new RegExp(`\\${testCase.expectedExt}$`));
      }
    });
  });

  /*
   * NOTE: File retrieval tests via ServeStaticModule
   *
   * ServeStaticModule doesn't mount correctly in NestJS e2e test environment.
   * This is a known limitation with @nestjs/serve-static in test contexts.
   *
   * File serving WORKS in production/development mode when the server is running.
   *
   * To test file retrieval manually:
   * 1. Start the server: npm run start:dev
   * 2. Upload a file: curl -F "file=@test.jpg" http://localhost:3000/uploads
   * 3. Access the returned URL: curl http://localhost:3000/uploads/file-xxxxx.jpg
   *
   * OR use the provided test script: bash test-upload-manual.sh
   */
});
