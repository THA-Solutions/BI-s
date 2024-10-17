import { Controller, Get, Param } from '@nestjs/common';
import { TicketsService } from './tickets.service';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) { }
  
  @Get()
  getHelloFromTickets(): string {
    return 'Hello from Tickets! Welcome to the Tickets Controller';
  }

  @Get('/:brand/:token')
  async findAllTicketsByBrand(
    @Param('brand') brand: string,
    @Param('token') token: string,
  ) {

    this.ticketsService.finalizeAllHandlers();
    
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

    const actions = await this.ticketsService.findAllSavedActionsPerAgent(brand, token);

    this.ticketsService.finalizeAllHandlers();
    
    return actions
  }
}
