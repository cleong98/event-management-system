import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { Readable } from 'stream';

describe('UploadsController', () => {
  let controller: UploadsController;

  const mockUploadsService = {
    validateFile: jest.fn(),
    getFileUrl: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadsController],
      providers: [
        {
          provide: UploadsService,
          useValue: mockUploadsService,
        },
      ],
    }).compile();

    controller = module.get<UploadsController>(UploadsController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadFile', () => {
    const mockFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'test.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: 1024 * 1024,
      destination: './uploads',
      filename: 'test-123456.jpg',
      path: './uploads/test-123456.jpg',
      buffer: Buffer.from(''),
      stream: new Readable(),
    };

    it('should successfully upload a valid file', () => {
      mockUploadsService.validateFile.mockImplementation(() => {});
      mockUploadsService.getFileUrl.mockReturnValue('http://localhost:3000/uploads/test-123456.jpg');

      const result = controller.uploadFile(mockFile);

      expect(mockUploadsService.validateFile).toHaveBeenCalledWith(mockFile);
      expect(mockUploadsService.getFileUrl).toHaveBeenCalledWith('test-123456.jpg');
      expect(result).toEqual({
        url: 'http://localhost:3000/uploads/test-123456.jpg',
        filename: 'test-123456.jpg',
        mimetype: 'image/jpeg',
        size: 1024 * 1024,
      });
    });

    it('should return correct response for PNG file', () => {
      const pngFile: Express.Multer.File = {
        ...mockFile,
        originalname: 'test.png',
        mimetype: 'image/png',
        filename: 'test-789.png',
        path: './uploads/test-789.png',
        size: 2 * 1024 * 1024,
      };

      mockUploadsService.validateFile.mockImplementation(() => {});
      mockUploadsService.getFileUrl.mockReturnValue('http://localhost:3000/uploads/test-789.png');

      const result = controller.uploadFile(pngFile);

      expect(result).toEqual({
        url: 'http://localhost:3000/uploads/test-789.png',
        filename: 'test-789.png',
        mimetype: 'image/png',
        size: 2 * 1024 * 1024,
      });
    });

    it('should return correct response for WEBP file', () => {
      const webpFile: Express.Multer.File = {
        ...mockFile,
        originalname: 'test.webp',
        mimetype: 'image/webp',
        filename: 'test-999.webp',
        path: './uploads/test-999.webp',
        size: 3 * 1024 * 1024,
      };

      mockUploadsService.validateFile.mockImplementation(() => {});
      mockUploadsService.getFileUrl.mockReturnValue('http://localhost:3000/uploads/test-999.webp');

      const result = controller.uploadFile(webpFile);

      expect(result).toEqual({
        url: 'http://localhost:3000/uploads/test-999.webp',
        filename: 'test-999.webp',
        mimetype: 'image/webp',
        size: 3 * 1024 * 1024,
      });
    });

    it('should throw BadRequestException when no file is uploaded', () => {
      expect(() => controller.uploadFile(undefined as any)).toThrow(BadRequestException);
      expect(() => controller.uploadFile(undefined as any)).toThrow('No file uploaded');
      expect(mockUploadsService.validateFile).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when null file is uploaded', () => {
      expect(() => controller.uploadFile(null as any)).toThrow(BadRequestException);
      expect(() => controller.uploadFile(null as any)).toThrow('No file uploaded');
    });

    it('should propagate validation errors from service', () => {
      const invalidFile: Express.Multer.File = {
        ...mockFile,
        mimetype: 'application/pdf',
      };

      mockUploadsService.validateFile.mockImplementation(() => {
        throw new BadRequestException(
          'Invalid file type. Only JPEG, PNG, and WEBP images are allowed.',
        );
      });

      expect(() => controller.uploadFile(invalidFile)).toThrow(BadRequestException);
      expect(() => controller.uploadFile(invalidFile)).toThrow(
        'Invalid file type. Only JPEG, PNG, and WEBP images are allowed.',
      );
      expect(mockUploadsService.validateFile).toHaveBeenCalledWith(invalidFile);
    });

    it('should propagate file size validation errors from service', () => {
      const largeFile: Express.Multer.File = {
        ...mockFile,
        size: 6 * 1024 * 1024,
      };

      mockUploadsService.validateFile.mockImplementation(() => {
        throw new BadRequestException('File size exceeds 5MB limit.');
      });

      expect(() => controller.uploadFile(largeFile)).toThrow(BadRequestException);
      expect(() => controller.uploadFile(largeFile)).toThrow(
        'File size exceeds 5MB limit.',
      );
    });

    it('should call service methods in correct order', () => {
      const callOrder: string[] = [];

      mockUploadsService.validateFile.mockImplementation(() => {
        callOrder.push('validate');
      });
      mockUploadsService.getFileUrl.mockImplementation(() => {
        callOrder.push('getUrl');
        return 'http://localhost:3000/uploads/test-123456.jpg';
      });

      controller.uploadFile(mockFile);

      expect(callOrder).toEqual(['validate', 'getUrl']);
    });

    it('should include all file metadata in response', () => {
      const fileWithMetadata: Express.Multer.File = {
        ...mockFile,
        originalname: 'my-photo.jpg',
        filename: 'file-1234567890-123456789.jpg',
        size: 1500000,
        mimetype: 'image/jpeg',
      };

      mockUploadsService.validateFile.mockImplementation(() => {});
      mockUploadsService.getFileUrl.mockReturnValue(
        'http://localhost:3000/uploads/file-1234567890-123456789.jpg',
      );

      const result = controller.uploadFile(fileWithMetadata);

      expect(result).toHaveProperty('url');
      expect(result).toHaveProperty('filename');
      expect(result).toHaveProperty('mimetype');
      expect(result).toHaveProperty('size');
      expect(result.size).toBe(1500000);
    });
  });
});
