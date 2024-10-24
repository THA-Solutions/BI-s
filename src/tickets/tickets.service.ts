import { Injectable } from '@nestjs/common';
import { FileHandler } from '../utils';
import { MovideskService } from '../movidesk/movidesk.service';
import { Ticket } from './entities/ticket.entity';
import TicketResponse from '../movidesk/entities/ticket.response.entity';
import { PartnerService } from 'src/partner/partner.service';
import { Partner } from 'src/database/entities/partner.entity';

@Injectable()
export class TicketsService {
  private brand: string;
  private ticketsResponse: TicketResponse[] = [];
  private newTickets: any[] = [];
  private oldTickets: any[] = [];
  private actionsPerAgent: any[] = [];
  private oldActionsPerAgent: any[] = [];
  private oldTicketsFileHandler: FileHandler;
  private actionsPerAgentFileHandler: FileHandler;
  private endPoint: Partner;
  private requestInProgress: boolean;

  constructor(
    private movideskService: MovideskService,
    private partnerService: PartnerService
  ) {
    this.resetState();
  }

  private resetState() {
    this.oldActionsPerAgent = [];
    this.oldTickets = [];
    this.actionsPerAgent = [];
    this.ticketsResponse = [];
    this.newTickets = [];
  }

  async initializeLocalFiles(brand: string) {
    // const basePath = './external_files/json';
    const basePath = `${require('path').resolve(__dirname, '../../external_files/json')}`;
    this.oldTicketsFileHandler = new FileHandler(`${basePath}/Tickets-${brand}.json`);
    this.actionsPerAgentFileHandler = new FileHandler(`${basePath}/Actions-${brand}.json`);
  }

  async findAndSaveAllTicketsFetchedByBrand(brand: string, token: string) {
    try {

      this.finalizeAllHandlers();

      this.brand = brand.toLowerCase();
      await this.initializeLocalFiles(brand);
      this.endPoint = await this.partnerService.findPartner(token);

      if (this.oldTicketsFileHandler.getFileExists() && this.actionsPerAgentFileHandler.getFileExists()) {
        this.readOldTickets();
        const updateTimeDifferenceInDays = this.partnerService.calculateTimeDifferenceOfLastUpdateAndNow(this.endPoint.lastTicketsUpdateDate);

        if (updateTimeDifferenceInDays >= 1) {
          this.movideskService.setLastTicketId(this.oldTickets[this.oldTickets.length - 1].id);
          await this.findTicketsInMovideskWithoutWaiting(this.endPoint);
          this.requestInProgress = false;

        }

        this.requestInProgress = false;
        return this.oldTickets;
      }

      await this.findTicketsInMovideskWithoutWaiting(this.endPoint);
    } catch (error) {
      this.requestInProgress = false;
      throw new Error(`Error while fetching and saving all tickets fetched by brand: ${error.message}`);
    }
  }

  async findAllSavedActionsPerAgent(brand: string, token: string) {
    try {
      this.brand = brand.toLowerCase();
      this.endPoint = await this.partnerService.findPartner(token);
      this.oldActionsPerAgent = [];

      if (this.actionsPerAgentFileHandler.checkFileExists()) {
        this.actionsPerAgentFileHandler.readLocalFile();
        this.oldActionsPerAgent = this.actionsPerAgentFileHandler.getFileContent();
      }

      return this.oldActionsPerAgent;
    } catch (error) {
      this.requestInProgress = false;
      throw new Error(`Error while fetching actions per agent: ${error.message}`);
    }
  }

  private async findTicketsInMovideskWithoutWaiting(endPoint: Partner) {
    try {
      if (this.endPoint) {
        setTimeout(async () => {
          this.movideskService.createMovideskApiEntity(
            endPoint.url,
            endPoint.id,
            endPoint.urlFields,
            '0',
            endPoint.brand,
            endPoint.lastTicketsUpdateDate
          );

          this.ticketsResponse = endPoint.lastTicketsUpdateDate == undefined || this.oldTickets.length === 0
            ? await this.movideskService.fetchAllTickets()
            : await this.movideskService.fetchRecentlyUpdatedTickets();

          if (!this.ticketsResponse || this.ticketsResponse.length === 0) {
            this.requestInProgress = false;
            throw new Error('No tickets fetched from Movidesk');
          }

          await this.formatFetchedTickets(endPoint.fields);
          await this.saveTicketsInLocalFile();
          await this.saveActionsPerAgentInLocalFile();
          this.finalizeAllHandlers();
        }, 0);
      }
    } catch (error) {
      this.requestInProgress = false;
      throw new Error(`Error while fetching tickets in Movidesk without waiting: ${error.message}`);
    }
  }

  private async formatFetchedTickets(fields?: any) {
    try {
      const formattedTickets = this.ticketsResponse.map(ticket => {
        if (ticket !== null) {
          let ticketEntity = this.createTicketEntity(ticket, fields);
          ticketEntity = this.treatTicketData(ticketEntity);
          return ticketEntity;
        }
        console.log('Ticket is null');
      });

      let lastTicketId = 0;
      formattedTickets.forEach(ticket => {
        console.log(ticket,'ticket');
        if (ticket != null && ticket.id > lastTicketId && ticket.getBrand().toLowerCase() === this.brand) {
          this.newTickets.push(ticket);
          lastTicketId = ticket.id;
        }
        else {
        }
      });
    } catch (error) {
      this.requestInProgress = false;
      throw new Error(`Error while formatting fetched tickets: ${error.message}`);
    }
  }

  private createTicketEntity(ticket: any, fields?: any) {
    try {
      console.log(ticket.brand);
      return new Ticket(
        ticket.id,
        null,
        ticket.ownerTeam || null,
        new Date(ticket.createdDate),
        ticket.closedIn ? new Date(ticket.closedIn) : null,
        ticket.resolvedIn ? new Date(ticket.resolvedIn) : null,
        ticket.baseStatus || null,
        ticket.serviceFirstLevel || null,
        ticket.serviceSecondLevel || null,
        ticket.serviceThirdLevel || null,
        ticket.category || null,
        ticket.justification || null,
        ticket.lifeTimeWorkingTime || null,
        ticket.resolvedInFirstCall,
        null,
        null,
        null,
        null,
        ticket.actions,
        null,
        null,
        ticket.urgency,
        ticket.customFieldValues,
        fields || this.endPoint.fields,
        ticket.statusHistories,
        ticket.ownerTeam || null,
        ticket.brand
      );
    } catch (error) {
      this.requestInProgress = false;
      throw new Error(`Error while creating ticket entity: ${error.message}`);
    }
  }

  private treatTicketData(ticket: Ticket) {
    try {
      ticket.setCreatorAgentUsingStatusHistoryOrActionsData();
      ticket.setCreatorTeamUsingStatusHistoryOrActionsData();
      ticket.mapFields();
      ticket.mapTicketActions();
      this.actionsPerAgent = [...this.actionsPerAgent, ...ticket.getActions()];
      ticket.deleteActions();
      ticket.deleteCustomFieldValues();
      ticket.deleteStatusHistories();
      ticket.deleteFields();
      return ticket;
    } catch (error) {
      this.requestInProgress = false;
      throw new Error(`Error while treating ticket data: ${error.message}`);
    }
  }

  private async saveTicketsInLocalFile() {
    try {
      if (this.oldTicketsFileHandler.checkFileExists() === true) {
        this.oldTicketsFileHandler.setFileContent(this.newTickets);
        await this.oldTicketsFileHandler.writeLocalFile();
        this.requestInProgress = false;
        this.newTickets = [];
      } else {
        this.mergeNewTicketsWithOld();
        this.oldTicketsFileHandler.setFileContent(this.oldTickets);
        await this.oldTicketsFileHandler.writeLocalFile();
        this.requestInProgress = false;
      }

      await this.updateEndPoints();

      return this.newTickets;
    } catch (error) {
      this.requestInProgress = false;
      throw new Error(`Error while saving tickets in local file: ${error.message}`);
    }
  }


  private mergeNewTicketsWithOld() {
    for (const ticket of this.newTickets) {
      const ticketIndex = this.oldTickets.findIndex(oldTicket => oldTicket.id === ticket.id);
      if (ticketIndex !== -1) {
        this.oldTickets[ticketIndex] = ticket;
      } else {
        this.oldTickets.push(ticket);
      }
    }
  }

  private async saveActionsPerAgentInLocalFile() {
    try {
      if (!this.actionsPerAgentFileHandler || !this.actionsPerAgent) return;

      this.actionsPerAgent = [...this.actionsPerAgentFileHandler.getFileContent(), ...this.actionsPerAgent];

      if (!this.actionsPerAgentFileHandler.checkFileExists()) {
        this.actionsPerAgentFileHandler.setFileContent(this.actionsPerAgent);
        await this.actionsPerAgentFileHandler.writeLocalFile();
        this.requestInProgress = false;
      } else {
        this.actionsPerAgentFileHandler.setFileContent(this.actionsPerAgent);
        await this.actionsPerAgentFileHandler.writeLocalFile();
        this.requestInProgress = false;
      }

      this.actionsPerAgent = [];
    } catch (error) {
      this.requestInProgress = false;
      throw new Error(`Error while saving actions per agent in local file: ${error.message}`);
    }
  }

  private async updateEndPoints() {
    this.endPoint.lastTicketsUpdateDate = new Date().toISOString();
    await this.partnerService.updatePartner(this.endPoint.id, { ...this.endPoint, fields: undefined });
  }

  private readOldTickets() {
    this.oldTickets = this.oldTicketsFileHandler.readLocalFile();
  }

  public getRequestsInProgress() {
    return this.requestInProgress;
  }

  public setRequestsInProgress(requestInProgress: boolean) {
    this.requestInProgress = requestInProgress;
  }

  public finalizeAllHandlers() {
    this.endPoint = null;
    this.resetState();
    this.oldTicketsFileHandler = null;
    this.actionsPerAgentFileHandler = null;
  }
}