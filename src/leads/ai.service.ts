import { Injectable, Logger } from '@nestjs/common';
import { Lead } from '@prisma/client';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly openai: OpenAI | null = null;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey && apiKey !== 'sk-tu-key-aqui' && apiKey !== 'mock_key') {
      this.openai = new OpenAI({
        apiKey: apiKey,
      });
    } else {
      this.logger.warn('OPENAI_API_KEY no encontrada o con valor por defecto. Usando Mock AI Service.');
    }
  }

  async generateSummary(lead: Lead): Promise<string> {
    const { nombre, presupuesto, fuente, producto_interes } = lead;
    const isHighPriority = (presupuesto ?? 0) > 1000;
    const priorityHeader = isHighPriority ? '--- LEAD DE ALTA PRIORIDAD ---\n\n' : '';

    const prompt = `Eres un experto en ventas. Genera un resumen ejecutivo de 2 párrafos para el lead ${nombre} que está interesado en ${producto_interes || 'nuestros productos'} con un presupuesto de ${presupuesto || 'no especificado'}. Analiza su potencial.`;

    if (!this.openai) {
      return this.generateMockSummary(priorityHeader, lead);
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Eres un asistente experto en análisis de ventas.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 300,
        temperature: 0.7,
      });

      return `${priorityHeader}${response.choices[0]?.message?.content || 'No se pudo generar el resumen.'}`;
    } catch (error) {
      this.logger.error('Error llamando a OpenAI API', error.message);
      return this.generateMockSummary(priorityHeader, lead);
    }
  }

  async generateGroupSummary(leads: Lead[]): Promise<string> {
    const isMock = !this.openai;
    const header = isMock ? '[MOCK AI ANALYSIS] ' : '';
    
    if (leads.length === 0) {
      return `${header}No se encontraron leads para analizar con los filtros proporcionados.`;
    }

    // Cálculos dinámicos para el resumen
    const totalCount = leads.length;
    const totalBudget = leads.reduce((sum, l) => sum + (l.presupuesto ?? 0), 0);
    
    // Encontrar fuente principal
    const fuenteCounts = leads.reduce((acc, l) => {
      acc[l.fuente] = (acc[l.fuente] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const mainSource = Object.entries(fuenteCounts).sort((a, b) => b[1] - a[1])[0][0];

    // Encontrar producto de interés principal
    const productCounts = leads.reduce((acc, l) => {
      const prod = l.producto_interes || 'Indefinido';
      acc[prod] = (acc[prod] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const mainProduct = Object.entries(productCounts).sort((a, b) => b[1] - a[1])[0][0];

    const mockContent = `Se han analizado ${totalCount} leads. La fuente principal detectada es ${mainSource} con un presupuesto total de $${totalBudget.toLocaleString()}. Recomendación: Basado en que su interés principal es ${mainProduct}, sugerimos reforzar la campaña en ${mainSource}.`;

    if (isMock) {
      return `${header}${mockContent}`;
    }

    // Aquí iría la llamada real a OpenAI para análisis grupal
    try {
      const prompt = `Analiza este grupo de ${totalCount} leads. 
Datos agregados: Fuente principal: ${mainSource}, Presupuesto Total: $${totalBudget}, Producto más buscado: ${mainProduct}. 
Genera un análisis estratégico detallado de 2 párrafos.`;

      const response = await this.openai!.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Eres un estratega senior de marketing y ventas.' },
          { role: 'user', content: prompt },
        ],
      });

      return response.choices[0]?.message?.content || mockContent;
    } catch (error) {
      this.logger.error('Error en resumen grupal AI', error.message);
      return `${header}${mockContent}`;
    }
  }

  private generateMockSummary(header: string, lead: Lead): string {
    const budget = lead.presupuesto ?? 0;
    return `${header}Resumen Ejecutivo (MOCK AI):
${lead.nombre} presenta un interés sólido en ${lead.producto_interes || 'nuestros servicios'} a través de la fuente ${lead.fuente}. 
Dado su presupuesto de ${budget}, se recomienda un seguimiento estratégico para maximizar la conversión. 
Su perfil sugiere un potencial ${budget > 1000 ? 'ALTO' : 'ESTÁNDAR'} basado en los parámetros de la industria.`;
  }
}
