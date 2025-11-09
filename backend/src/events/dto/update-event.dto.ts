import { IsString, IsOptional, IsDateString, IsEnum, IsUrl, MaxLength } from 'class-validator';
import { EventStatus } from '@prisma/client';

export class UpdateEventDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  name?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  @MaxLength(300)
  location?: string;

  @IsUrl()
  @IsOptional()
  posterUrl?: string;

  @IsEnum(EventStatus)
  @IsOptional()
  status?: EventStatus;
}
