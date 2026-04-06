import { Injectable, NotFoundException, BadRequestException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { GetLeadsFilterDto } from './dto/get-leads-filter.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createLeadDto: CreateLeadDto) {
    try {
      return await this.prisma.lead.create({
        data: createLeadDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('El correo electrónico ya se encuentra registrado');
        }
      }
      throw new InternalServerErrorException('Error inesperado al crear el lead');
    }
  }

  async findAll(filterDto: GetLeadsFilterDto) {
    const { page = 1, limit = 10, fuente, startDate, endDate } = filterDto;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
    };

    if (fuente) {
      where.fuente = fuente;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.lead.count({
        where,
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
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
      throw new NotFoundException(`Lead con ID ${id} no encontrado`);
    }

    return lead;
  }

  async update(id: string, updateLeadDto: UpdateLeadDto) {
    await this.findOne(id);
    
    try {
      return await this.prisma.lead.update({
        where: { id },
        data: updateLeadDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('El correo electrónico ya se encuentra registrado en otro lead');
        }
      }
      throw new InternalServerErrorException('Error inesperado al actualizar el lead');
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.lead.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async getStats() {
    const last7DaysDate = new Date();
    last7DaysDate.setDate(last7DaysDate.getDate() - 7);

    const [total, leadsPorFuente, promedioPresupuesto, leadsRecientes] = await Promise.all([
      this.prisma.lead.count({
        where: { deletedAt: null },
      }),
      this.prisma.lead.groupBy({
        by: ['fuente'],
        _count: {
          _all: true,
        },
        where: { deletedAt: null },
      }),
      this.prisma.lead.aggregate({
        where: { deletedAt: null },
        _avg: {
          presupuesto: true,
        },
      }),
      this.prisma.lead.count({
        where: {
          deletedAt: null,
          createdAt: {
            gte: last7DaysDate,
          },
        },
      }),
    ]);

    return {
      totalLeads: total,
      leadsPorFuente: leadsPorFuente.map((item) => ({
        fuente: item.fuente,
        cantidad: item._count._all,
      })),
      promedioPresupuesto: promedioPresupuesto._avg?.presupuesto || 0,
      leadsUltimos7Dias: leadsRecientes,
    };
  }

  async getLeadsForSummary(filters: any) {
    const { fuente, fechaInicio, fechaFin } = filters;
    const where: any = { deletedAt: null };

    if (fuente) {
      where.fuente = fuente;
    }

    if (fechaInicio || fechaFin) {
      where.createdAt = {};
      if (fechaInicio) where.createdAt.gte = new Date(fechaInicio);
      if (fechaFin) {
        const end = new Date(fechaFin);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    return this.prisma.lead.findMany({
      where,
      take: 50,
      orderBy: { createdAt: 'desc' },
    });
  }
}
