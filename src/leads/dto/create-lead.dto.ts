import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';
import { SourceType } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLeadDto {
  @ApiProperty({ example: 'Juan Perez' })
  @IsString()
  @MinLength(2)
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 'juan.perez@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsString()
  @IsOptional()
  telefono?: string;

  @ApiProperty({ enum: SourceType, example: SourceType.landing_page })
  @IsEnum(SourceType)
  @IsNotEmpty()
  fuente: SourceType;

  @ApiPropertyOptional({ example: 'CRM Software' })
  @IsString()
  @IsOptional()
  producto_interes?: string;

  @ApiPropertyOptional({ example: 1500.50 })
  @IsNumber()
  @IsOptional()
  presupuesto?: number;
}
