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

    
    if (this.ticketsService.getRequestsInProgress() === true) {
      return { message: 'Request in progress' }
    } else {
      this.ticketsService.setRequestsInProgress(true);
    };

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


    // this.oldTicketsFileHandler = new FileHandler(
    //   `${require('path').resolve(__dirname, '../../external_files/json')}/Tickets-${brand}.json`,
    // );
    // this.actionsPerAgentFileHandler = new FileHandler(
    //   `${require('path').resolve(__dirname, '../../external_files/json')}/Actions-${brand}.json`,
    // );