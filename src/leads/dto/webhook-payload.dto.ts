import { IsArray, IsEmail, IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class AnswerFieldDto {
  @ApiProperty({ description: 'ID del campo en Typeform' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Tipo de campo (email, short_text, etc.)' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'Referencia única del campo', required: false })
  @IsString()
  @IsOptional()
  ref?: string;
}

class AnswerDto {
  @ApiProperty({ description: 'Tipo de respuesta' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'Contenido de la respuesta (texto)', required: false })
  @IsString()
  @IsOptional()
  text?: string;

  @ApiProperty({ description: 'Contenido de la respuesta (email)', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'Contenido de la respuesta (número)', required: false })
  @IsOptional()
  number?: number;

  @ApiProperty({ type: AnswerFieldDto })
  @IsObject()
  @ValidateNested()
  @Type(() => AnswerFieldDto)
  field: AnswerFieldDto;
}

class FormResponseDto {
  @ApiProperty({ description: 'ID del formulario' })
  @IsString()
  form_id: string;

  @ApiProperty({ description: 'Token de envío' })
  @IsString()
  token: string;

  @ApiProperty({ description: 'Fecha de envío' })
  @IsString()
  submitted_at: string;

  @ApiProperty({ type: [AnswerDto], description: 'Lista de respuestas enviadas' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers: AnswerDto[];
}

export class WebhookPayloadDto {
  @ApiProperty({ description: 'ID único del evento' })
  @IsString()
  event_id: string;

  @ApiProperty({ description: 'Tipo de evento (p.ej. form_response)' })
  @IsString()
  event_type: string;

  @ApiProperty({ type: FormResponseDto })
  @IsObject()
  @ValidateNested()
  @Type(() => FormResponseDto)
  form_response: FormResponseDto;
}
