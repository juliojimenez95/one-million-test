import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { PaginationDto } from './dto/pagination.dto';

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createLeadDto: CreateLeadDto) {
    return this.prisma.lead.create({
      data: createLeadDto,
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { skip, take } = paginationDto;
    const [data, total] = await Promise.all([
      this.prisma.lead.findMany({
        where: { deletedAt: null }, // Automatically filter out soft-deleted records
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.lead.count({
        where: { deletedAt: null },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        skip,
        take,
      },
    };
  }

  async findOne(id: string) {
    const lead = await this.prisma.lead.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!lead) {
      throw new NotFoundException(`Lead with id ${id} not found`);
    }

    return lead;
  }

  async update(id: string, updateLeadDto: UpdateLeadDto) {
    // Ensure it exists and is not soft deleted
    await this.findOne(id);
    return this.prisma.lead.update({
      where: { id },
      data: updateLeadDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    // Soft delete by setting deletedAt to current timestamp
    return this.prisma.lead.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async handleTypeformWebhook(payload: any) {
    // Dummy transformation from Typeform raw payload to Lead system format.
    // In a real scenario, we extract fields from payload.form_response.answers
    try {
      const answers = payload.form_response?.answers || [];
      
      // We simulate extraction assuming answers are mapped correctly. 
      // This is just a conceptual mapping as requested "simular la entrada de datos de Typeform y transformar"
      const nombre = answers.find((a: any) => a.type === 'text')?.text || 'Lead Webhook';
      const email = answers.find((a: any) => a.type === 'email')?.email || `webhook-${Date.now()}@example.com`;
      const telefono = answers.find((a: any) => a.type === 'phone_number')?.phone_number;

      return this.prisma.lead.create({
        data: {
          nombre,
          email,
          telefono,
          fuente: 'landing_page', // Defaulting to landing_page for Typeform submissions
        },
      });
    } catch (error) {
       console.error('Error parsing Typeform webhook', error);
       throw error;
    }
  }
}
