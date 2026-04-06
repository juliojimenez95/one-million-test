import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { SourceType } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GroupSummaryFilterDto {
  @ApiPropertyOptional({ enum: SourceType, description: 'Filtrar por fuente para el resumen' })
  @IsOptional()
  @IsEnum(SourceType)
  fuente?: SourceType;

  @ApiPropertyOptional({ example: '2023-01-01', description: 'Fecha de inicio del rango' })
  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @ApiPropertyOptional({ example: '2023-12-31', description: 'Fecha de fin del rango' })
  @IsOptional()
  @IsDateString()
  fechaFin?: string;
}
