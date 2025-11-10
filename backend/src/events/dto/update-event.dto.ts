import { IsString, IsOptional, IsDateString, IsEnum, IsUrl, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EventStatus } from '@prisma/client';

export class UpdateEventDto {
  @ApiPropertyOptional({
    description: 'Event name',
    example: 'Tech Conference 2024',
    maxLength: 200,
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({
    description: 'Event start date and time (ISO 8601 format)',
    example: '2024-12-01T09:00:00Z',
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Event end date and time (ISO 8601 format)',
    example: '2024-12-01T17:00:00Z',
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Event location',
    example: 'San Francisco Convention Center',
    maxLength: 300,
  })
  @IsString()
  @IsOptional()
  @MaxLength(300)
  location?: string;

  @ApiPropertyOptional({
    description: 'URL to event poster image',
    example: 'https://example.com/posters/tech-conf-2024.jpg',
  })
  @IsUrl()
  @IsOptional()
  posterUrl?: string;

  @ApiPropertyOptional({
    description: 'Event status',
    enum: EventStatus,
    example: EventStatus.ONGOING,
  })
  @IsEnum(EventStatus)
  @IsOptional()
  status?: EventStatus;
}
