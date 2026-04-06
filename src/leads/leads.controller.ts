import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { PaginationDto } from './dto/pagination.dto';
import { Public } from '../auth/decorators/public.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('Leads')
@ApiBearerAuth()
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new lead' })
  @ApiResponse({ status: 201, description: 'Lead successfully created.' })
  create(@Body() createLeadDto: CreateLeadDto) {
    return this.leadsService.create(createLeadDto);
  }

  @Public()
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Typeform Webhook to receive incoming leads automatically' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  handleWebhook(@Body() payload: any) {
    return this.leadsService.handleTypeformWebhook(payload);
  }

  @Get()
  @ApiOperation({ summary: 'List all leads (filter out soft deleted)' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.leadsService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a lead by ID' })
  findOne(@Param('id') id: string) {
    return this.leadsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a lead by ID' })
  update(@Param('id') id: string, @Body() updateLeadDto: UpdateLeadDto) {
    return this.leadsService.update(id, updateLeadDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a lead by ID' })
  remove(@Param('id') id: string) {
    return this.leadsService.remove(id);
  }
}
