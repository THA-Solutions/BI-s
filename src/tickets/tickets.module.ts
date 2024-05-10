import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { EndPoint } from './entities/endpoint.entity';

@Module({
  imports: [EndPoint],
  controllers: [TicketsController],
  providers: [TicketsService],
})
export class TicketsModule {}
