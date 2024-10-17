import { Injectable } from '@nestjs/common';
import { FileHandler } from '../utils';
import { MovideskService } from '../movidesk/movidesk.service';
import { Ticket } from './entities/ticket.entity';
import TicketResponse from '../movidesk/entities/ticket.response.entity';
import { PartnerService } from 'src/partner/partner.service';
import { Partner } from 'src/database/entities/partner.entity';
import { time } from 'console';
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

  private requestInProgress: boolean = false;

  constructor(private movideskService: MovideskService, private partnerService: PartnerService) {
    this.oldActionsPerAgent = [];
    this.oldTickets = [];

    this.actionsPerAgent = [];
    this.ticketsResponse = [];
    this.newTickets = [];

  }

  async initializeLocalFiles(brand: string) {
    this.oldTicketsFileHandler = new FileHandler(
      `${require('path').resolve(__dirname, '../../external_files/json')}/Tickets-${brand}.json`,
    );
    this.actionsPerAgentFileHandler = new FileHandler(
      `${require('path').resolve(__dirname, '../../external_files/json')}/Actions-${brand}.json`,
    );


  }

  async findAndSaveAllTicketsFetchedByBrand(brand: string, token: string) {
    try {

      this.brand = brand.toLowerCase();

      this.initializeLocalFiles(brand);

      this.endPoint = await this.partnerService.findPartner(token);

      if (
        this.oldTicketsFileHandler.checkFileExists() &&
        this.actionsPerAgentFileHandler.checkFileExists()
      ) {

        this.readOldTickets();
        const updateTimeDifferenceInDays =
          (new Date().getTime() -
            new Date(this.endPoint.lastTicketsUpdateDate).getTime()) /
          (1000 * 60 * 60 * 24);

        if (this.requestInProgress == false && updateTimeDifferenceInDays >= 1) {

          setTimeout(async () => {
            this.requestInProgress = true;

            this.movideskService.createMovideskApiEntity(
              this.endPoint.url,
              this.endPoint.id,
              this.endPoint.urlFields,
              '0',
              this.endPoint.brand,
              this.endPoint.lastTicketsUpdateDate,
            );
            this.movideskService.setLastTicketId(
              this.oldTickets[this.oldTickets.length - 1].id,
            );
            // this.movideskService.setTickets(this.oldTickets);
            this.ticketsResponse = await this.movideskService.fetchRecentlyUpdatedTickets();

            if (this.ticketsResponse == undefined || this.ticketsResponse.length === 0) throw new Error('No tickets fetched from Movidesk');

            this.formatFetchedTickets();

            this.saveTicketsInLocalFile();
            this.saveActionsPerAgentInLocalFile();

          }, 0);

        }
        return this.oldTickets;
      }

      this.findTicketsInMovideskWithoutWaiting();

      return;
    } catch (error) {
      throw new Error(`Error while fetching and saving all tickets fetched by brand: ${error}`);
    }
  }

  async findAllSavedActionsPerAgent(brand: string, token: string) {
    try {
      this.brand = brand.toLowerCase();

      this.actionsPerAgentFileHandler = new FileHandler(
        `${require('path').resolve(__dirname, '../../external_files/json')}/Actions-${brand}.json`,
      );



      this.endPoint = await this.partnerService.findPartner(token);
      this.oldActionsPerAgent = [];

      if (this.actionsPerAgentFileHandler.checkFileExists()) {
        this.actionsPerAgentFileHandler.readLocalFile();
        this.oldActionsPerAgent = this.actionsPerAgentFileHandler.getFileContent();
      }

      return this.oldActionsPerAgent;
    } catch (error) {
      throw new Error(`Error while fetching actions per agent: ${error}`);
    }
  }

  private async findTicketsInMovideskWithoutWaiting() {
    try {
      const endPoint = this.endPoint;

      if (this.endPoint) {
        setTimeout(async () => {
          this.movideskService.createMovideskApiEntity(
            endPoint.url,
            endPoint.id,
            endPoint.urlFields,
            '0',
            endPoint.brand,
            endPoint.lastTicketsUpdateDate,
          );

          this.ticketsResponse = await this.movideskService.fetchAllTickets();

          if (this.ticketsResponse == undefined || this.ticketsResponse.length === 0) throw new Error('No tickets fetched from Movidesk');

          await this.formatFetchedTickets(endPoint.fields);

          this.saveTicketsInLocalFile();

          this.saveActionsPerAgentInLocalFile();

        }, 0);
      }
    } catch (error) {
      throw new Error(`Error while fetching tickets in Movidesk without waiting: ${error}`);
    }
  }

  private async formatFetchedTickets(fields? ) {
    try {
      const formattedTickets = this.ticketsResponse.map((ticket) => {
        if (ticket == null) {
          return null;
        }
        let ticketEntity = this.createTicketEntity(ticket, fields);

        ticketEntity = this.treatTicketData(ticketEntity);

        return ticketEntity;
      });

      let lastTicketId: number = 0;

      formattedTickets.forEach((ticket) => {
        if (ticket != null && ticket.id > lastTicketId) {
          this.newTickets.push(ticket);
          lastTicketId = ticket.id;
        }
      });
    } catch (error) {
      throw new Error(`Error while formatting fetched tickets: ${error}`);
    }
  }

  private createTicketEntity(ticket, fields?) {
    try {
      return new Ticket(
        ticket.id,
        null,
        ticket.ownerTeam ? ticket.ownerTeam : null,
        new Date(ticket.createdDate),
        ticket.closedIn ? new Date(ticket.closedIn) : null,
        ticket.resolvedIn ? new Date(ticket.resolvedIn) : null,
        ticket.baseStatus ? ticket.baseStatus : null,
        ticket.serviceFirstLevel ? ticket.serviceFirstLevel : null,
        ticket.serviceSecondLevel ? ticket.serviceSecondLevel : null,
        ticket.serviceThirdLevel ? ticket.serviceThirdLevel : null,
        ticket.category ? ticket.category : null,
        ticket.justification ? ticket.justification : null,
        ticket.lifeTimeWorkingTime ? ticket.lifeTimeWorkingTime : null,
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
        fields ? fields : this.endPoint.fields,
        ticket.statusHistories,
        ticket.ownerTeam ? ticket.ownerTeam : null
      );
    } catch (error) {
      throw new Error(`Error while creating ticket entity: ${error}`);
    }
  }

  private treatTicketData(ticket) {
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
      throw new Error(`Error while treating ticket data: ${error}`);
    }
  }

  private async saveTicketsInLocalFile() {
    try {
      if (this.oldTicketsFileHandler.checkFileExists() == false) {
        this.oldTicketsFileHandler.setFileContent(this.newTickets);
        await this.oldTicketsFileHandler.writeLocalFile();
        this.newTickets = [];
      } else {

        for (let i = 0; i < this.newTickets.length; i++) {
          const ticket = this.newTickets[i];
          const ticketIndex = this.oldTickets.findIndex(
            (oldTicket) => oldTicket.id === ticket.id,
          );

          if (ticketIndex !== -1) {
            this.oldTickets[ticketIndex] = ticket;
          } else {
            this.oldTickets.push(ticket);
          }
        }

        this.oldTicketsFileHandler.setFileContent(
          this.oldTickets
        );
        await this.oldTicketsFileHandler.writeLocalFile();

        this.oldTickets = []
        this.newTickets = [];
      }

      this.updateEndPoints();

      this.requestInProgress = false;

      this.finalizeAllHandlers();

      return this.newTickets;
    } catch (error) {
      throw new Error(`Error while saving tickets in local file: ${error}`);
    }
  }

  private async saveActionsPerAgentInLocalFile() {
    try {

      this.actionsPerAgent = [...this.actionsPerAgentFileHandler.getFileContent(), ...this.actionsPerAgent];

      if (this.actionsPerAgentFileHandler.checkFileExists() == false) {

        this.actionsPerAgentFileHandler.setFileContent(this.actionsPerAgent);
        this.actionsPerAgentFileHandler.writeLocalFile();

      } else {

        this.actionsPerAgentFileHandler.setFileContent(
          this.actionsPerAgent
        );
        this.actionsPerAgentFileHandler.writeLocalFile();

      }

      this.requestInProgress = false;

      this.actionsPerAgent = [];
    } catch (error) {
      throw new Error(`Error while saving actions per agent in local file: ${error}`);
    }
  }

  private async updateEndPoints() {
    this.endPoint.lastTicketsUpdateDate = new Date().toISOString();

    await this.partnerService.updatePartner(this.endPoint.id, this.endPoint);
  }

  private readOldTickets() {
    this.oldTicketsFileHandler.readLocalFile();

    this.oldTickets = this.oldTicketsFileHandler.getFileContent();
  }

  public finalizeAllHandlers() {
    this.endPoint = null;
    this.newTickets = [];
    this.oldTickets = [];
    this.actionsPerAgent = [];
    this.oldActionsPerAgent = [];
    this.oldTicketsFileHandler = null;
    this.actionsPerAgentFileHandler = null;
  }
}
