import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';
import { SourceType } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLeadDto {
  @ApiProperty({ example: 'Juan Perez', description: 'Nombre completo del lead' })
  @IsString()
  @MinLength(2)
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 'nuevo.lead@ejemplo.com', description: 'Email de contacto' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ example: '+1234567890', description: 'Teléfono de contacto' })
  @IsString()
  @IsOptional()
  telefono?: string;

  @ApiProperty({ enum: SourceType, example: SourceType.landing_page, description: 'Fuente de origen' })
  @IsEnum(SourceType)
  @IsNotEmpty()
  fuente: SourceType;

  @ApiPropertyOptional({ example: 'Software ERP', description: 'Producto de interés' })
  @IsString()
  @IsOptional()
  producto_interes?: string;

  @ApiPropertyOptional({ example: 1500.50, description: 'Presupuesto estimado' })
  @IsNumber()
  @IsOptional()
  presupuesto?: number;
}
