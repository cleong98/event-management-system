import { IsString, IsNotEmpty, IsDateString, IsOptional, IsUrl, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({
    description: 'Event name',
    example: 'Tech Conference 2024',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiProperty({
    description: 'Event start date and time (ISO 8601 format)',
    example: '2024-12-01T09:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({
    description: 'Event end date and time (ISO 8601 format)',
    example: '2024-12-01T17:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiProperty({
    description: 'Event location',
    example: 'San Francisco Convention Center',
    maxLength: 300,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  location: string;

  @ApiPropertyOptional({
    description: 'URL to event poster image',
    example: 'http://localhost:3000/uploads/poster.jpg',
  })
  @IsUrl({ require_tld: false })
  @IsOptional()
  posterUrl?: string;
}
