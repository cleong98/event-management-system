import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UploadsService } from './uploads.service';
import { Readable } from 'stream';

describe('UploadsService', () => {
  let service: UploadsService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadsService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: string) => {
              if (key === 'APP_URL') {
                return 'http://localhost:3000';
              }
              return defaultValue;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<UploadsService>(UploadsService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateFile', () => {
    it('should validate a valid JPEG file', () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024 * 1024, // 1MB
        destination: './uploads',
        filename: 'test-123.jpg',
        path: './uploads/test-123.jpg',
        buffer: Buffer.from(''),
        stream: new Readable(),
      };

      expect(() => service.validateFile(mockFile)).not.toThrow();
    });

    it('should validate a valid PNG file', () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test.png',
        encoding: '7bit',
        mimetype: 'image/png',
        size: 2 * 1024 * 1024, // 2MB
        destination: './uploads',
        filename: 'test-456.png',
        path: './uploads/test-456.png',
        buffer: Buffer.from(''),
        stream: new Readable(),
      };

      expect(() => service.validateFile(mockFile)).not.toThrow();
    });

    it('should validate a valid WEBP file', () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test.webp',
        encoding: '7bit',
        mimetype: 'image/webp',
        size: 3 * 1024 * 1024, // 3MB
        destination: './uploads',
        filename: 'test-789.webp',
        path: './uploads/test-789.webp',
        buffer: Buffer.from(''),
        stream: new Readable(),
      };

      expect(() => service.validateFile(mockFile)).not.toThrow();
    });

    it('should throw BadRequestException for invalid file type', () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test.pdf',
        encoding: '7bit',
        mimetype: 'application/pdf',
        size: 1024 * 1024,
        destination: './uploads',
        filename: 'test-123.pdf',
        path: './uploads/test-123.pdf',
        buffer: Buffer.from(''),
        stream: new Readable(),
      };

      expect(() => service.validateFile(mockFile)).toThrow(BadRequestException);
      expect(() => service.validateFile(mockFile)).toThrow(
        'Invalid file type. Only JPEG, PNG, and WEBP images are allowed.',
      );
    });

    it('should throw BadRequestException for file exceeding size limit', () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 6 * 1024 * 1024, // 6MB - exceeds 5MB limit
        destination: './uploads',
        filename: 'test-123.jpg',
        path: './uploads/test-123.jpg',
        buffer: Buffer.from(''),
        stream: new Readable(),
      };

      expect(() => service.validateFile(mockFile)).toThrow(BadRequestException);
      expect(() => service.validateFile(mockFile)).toThrow(
        'File size exceeds 5MB limit.',
      );
    });

    it('should throw BadRequestException for file at exactly 5MB + 1 byte', () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 5 * 1024 * 1024 + 1, // Just over 5MB
        destination: './uploads',
        filename: 'test-123.jpg',
        path: './uploads/test-123.jpg',
        buffer: Buffer.from(''),
        stream: new Readable(),
      };

      expect(() => service.validateFile(mockFile)).toThrow(BadRequestException);
    });

    it('should accept file at exactly 5MB', () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 5 * 1024 * 1024, // Exactly 5MB
        destination: './uploads',
        filename: 'test-123.jpg',
        path: './uploads/test-123.jpg',
        buffer: Buffer.from(''),
        stream: new Readable(),
      };

      expect(() => service.validateFile(mockFile)).not.toThrow();
    });
  });

  describe('getFileUrl', () => {
    it('should return correct full URL for a given filename', () => {
      const filename = 'test-123.jpg';
      const url = service.getFileUrl(filename);
      expect(url).toBe('http://localhost:3000/uploads/test-123.jpg');
    });

    it('should return correct full URL for PNG file', () => {
      const filename = 'image-456.png';
      const url = service.getFileUrl(filename);
      expect(url).toBe('http://localhost:3000/uploads/image-456.png');
    });

    it('should return correct full URL for WEBP file', () => {
      const filename = 'photo-789.webp';
      const url = service.getFileUrl(filename);
      expect(url).toBe('http://localhost:3000/uploads/photo-789.webp');
    });

    it('should handle filenames with special characters', () => {
      const filename = 'my-file_123-test.jpg';
      const url = service.getFileUrl(filename);
      expect(url).toBe('http://localhost:3000/uploads/my-file_123-test.jpg');
    });
  });
});
