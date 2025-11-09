import { IsString, IsNotEmpty, IsDateString, IsOptional, IsUrl, MaxLength } from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  location: string;

  @IsUrl()
  @IsOptional()
  posterUrl?: string;
}
