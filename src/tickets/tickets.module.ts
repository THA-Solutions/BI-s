import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { MovideskModule } from '../movidesk/movidesk.module';
import { PartnerModule } from 'src/partner/partner.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [MovideskModule,PartnerModule,ConfigModule.forRoot({ isGlobal: true })],
  controllers: [TicketsController],
  providers: [TicketsService],
})
export class TicketsModule {}
