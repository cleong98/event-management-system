import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadsService {
  constructor(private readonly configService: ConfigService) {}

  validateFile(file: Express.Multer.File): void {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, and WEBP images are allowed.',
      );
    }

    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 5MB limit.');
    }
  }

  getFileUrl(filename: string): string {
    const appUrl = this.configService.get<string>('APP_URL', 'http://localhost:3000');
    return `${appUrl}/uploads/${filename}`;
  }
}
