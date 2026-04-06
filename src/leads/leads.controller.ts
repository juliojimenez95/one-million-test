import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { GetLeadsFilterDto } from './dto/get-leads-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('Leads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Obtener estadísticas de leads' })
  @ApiResponse({ status: 200, description: 'Estadísticas obtenidas correctamente.' })
  getStats() {
    return this.leadsService.getStats();
  }

  @Post()
  @ApiOperation({ summary: 'Registrar un nuevo lead' })
  @ApiResponse({ status: 201, description: 'Lead registrado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Error en la validación o email duplicado.' })
  create(@Body() createLeadDto: CreateLeadDto) {
    return this.leadsService.create(createLeadDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los leads con filtros y paginación' })
  @ApiResponse({ status: 200, description: 'Lista de leads obtenida correctamente.' })
  findAll(@Query() filterDto: GetLeadsFilterDto) {
    return this.leadsService.findAll(filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un lead por su ID' })
  @ApiResponse({ status: 200, description: 'Lead encontrado.' })
  @ApiResponse({ status: 404, description: 'Lead no encontrado.' })
  findOne(@Param('id') id: string) {
    return this.leadsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar la información de un lead' })
  @ApiResponse({ status: 200, description: 'Lead actualizado correctamente.' })
  @ApiResponse({ status: 404, description: 'Lead no encontrado.' })
  update(@Param('id') id: string, @Body() updateLeadDto: UpdateLeadDto) {
    return this.leadsService.update(id, updateLeadDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un lead (Soft Delete)' })
  @ApiResponse({ status: 200, description: 'Lead eliminado correctamente.' })
  @ApiResponse({ status: 404, description: 'Lead no encontrado.' })
  remove(@Param('id') id: string) {
    return this.leadsService.remove(id);
  }
}
