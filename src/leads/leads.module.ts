import { Module } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';
import { AiService } from './ai.service';

@Module({
  providers: [LeadsService, AiService],
  controllers: [LeadsController],
})
export class LeadsModule {}
