import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteEventDto {
  @ApiProperty({
    description: 'User password for verification before deletion',
    example: 'Password123!',
    type: String,
  })
  @IsString()
  password: string;
}
