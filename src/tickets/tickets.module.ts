import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { MovideskModule } from '../movidesk/movidesk.module';
import { PartnerModule } from 'src/partner/partner.module';

@Module({
  imports: [MovideskModule,PartnerModule],
  controllers: [TicketsController],
  providers: [TicketsService],
})
export class TicketsModule {}
