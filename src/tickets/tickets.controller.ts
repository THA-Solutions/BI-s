import { Controller, Get, Param } from '@nestjs/common';
import { TicketsService } from './tickets.service';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get('/:brand/:token')
  async findAllTicketsByBrand(
    @Param('brand') brand: string,
    @Param('token') token: string,
  ) {

    const tickets = await this.ticketsService.findAndSaveAllTicketsFetchedByBrand(
      brand,
      token,
    );

    return tickets
  }

  @Get('/:brand/:token/actions')
  async findActionsPerAgent(
    @Param('brand') brand: string,
    @Param('token') token: string,
  ) {
    return await this.ticketsService.findAllSavedActionsPerAgent(brand, token);
  }
}
