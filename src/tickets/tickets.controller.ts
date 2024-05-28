import { Controller, Get, Param } from '@nestjs/common';
import { TicketsService } from './tickets.service';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get('/:brand/:token')
  async findAll(@Param('brand') brand: string, @Param('token') token: string) {
    return await this.ticketsService.findAllByBrand(brand,token);
  }

  @Get('/:brand/:token/actions')
  async findActionsPerAgent(@Param('brand') brand: string, @Param('token') token: string) {
    return await this.ticketsService.findActionsPerAgent(brand,token);
  }

}
