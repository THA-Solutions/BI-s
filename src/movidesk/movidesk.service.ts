import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { Movidesk } from './entities/movidesk.entity';
import { RequestParams } from './entities/requestParams.entity';
import { FileHandler } from 'src/utils';

@Injectable()
export class MovideskService {
  private movidesk: Movidesk;

  private tickets: any[];

  private lastTicketId: number;

  private requestParams: RequestParams;

  private localFileHandler: FileHandler;

  constructor() {
    this.tickets = [];
    this.lastTicketId = 0;
  }

  private delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
  } 

  public createMovideskApiEntity(
    baseUrl: string,
    movideskApiToken: string,
    fieldsToFetch,
    ticketsOffSet: string,
    brand: string,
    lastTicketsUpdateDate?,
  ): void {
    this.movidesk = new Movidesk(
      baseUrl,
      movideskApiToken,
      fieldsToFetch,
      ticketsOffSet,
      brand,
      lastTicketsUpdateDate,
    );
    this.localFileHandler = new FileHandler(
      `${require('path').resolve(__dirname, '../external_files/json')}/Tickets-${this.movidesk.getBrand()}.json`,
    );

    return;
  }
  
  public getMovideskApiEntity(): Movidesk {
    return this.movidesk;
  }

  public setLastTicketId(id: number): void {
    this.lastTicketId = id;
  }

  public getLastTicketId(): number {
    return this.lastTicketId;
  }

  public setTickets(tickets: any[]): void {
    this.tickets = tickets;
  }

  private pushTicket(ticket: any): void {
    this.tickets.push(ticket);
  }

  public getTickets(): any[] {
    return this.tickets;
  }

  async fetchLatestCreatedTicket() {
    try {
      if (!this.movidesk){
        throw new Error('A movidesk entity must be instantiated');
      }
      const newestTicketId = await axios
        .get(this.movidesk.getCompleteUrlOfLastCreatedTicket())
        .then((res) => {
          if (res.data.length > 0) {
            return res.data[res.data.length - 1].id;
          } else {
            return 0;
          }
        });
      return newestTicketId;
    } catch (error) {
      throw new Error(`Error while fetching latest created ticket: ${error}`);
    }
  }

  async fetchTicketsInMovideskApi(retryCount = 0) {
  
    Logger.warn(`Fetching tickets from Movidesk API - Skip ${this.requestParams.getActualRequest() * 1000}`);

    const apiUrlInUse =
      this.requestParams.getCurrentApiUrlRoute() === 0
        ? this.movidesk.getCompletePastTicketsApiUrl()
        : this.movidesk.getCompleteRecentlyUpdatedTicketsApiUrl();

    this.requestParams.increaseActualRequestByOne();
    return await axios
      .get(apiUrlInUse)
      .then(async (res) => {
        if (res.data.length === 0) {
          if (this.requestParams.getCurrentApiUrlRoute() === 0) {
            this.requestParams.changeCurrentApiUrlRoute(0);
            this.requestParams.setActualRequest(0);

            this.movidesk.setTicketsOffSet(
              (this.requestParams.getActualRequest() * 1000).toString(),
            );

            await this.fetchTicketsInMovideskApi();
          } else {
            return [];
          }
        }

        
        this.requestParams.increaseNumberOfRequestsInProgresstByOne();
        
        this.movidesk.setTicketsOffSet(
          (this.requestParams.getActualRequest() * 1000).toString(),
        );
        
        res.data = res.data.map((ticket) => {
          if (ticket.id > this.lastTicketId && ticket.id !== this.lastTicketId) {
            this.lastTicketId = ticket.id;

            this.pushTicket(ticket);

            return ticket;
          } else {
            return null;
          }
        });
 
        return res.data;
      })
      .catch(async (error) => {
        console.error('Error while fetching tickets', error);
        if (error.response && error.response.status === 500) {
          if (retryCount < 3) {
            console.error(
              `Error 500 while fetching tickets, trying again in 5 seconds (Attempt ${retryCount + 1})`,
            );
            await this.delay(5000); // Espera 5 segundos antes de tentar novamente
            return await this.fetchTicketsInMovideskApi(retryCount + 1);
          } else {
            throw new Error(
              `Error 500 while fetching tickets after ${retryCount + 1} attempts`,
            );
          }
        } else {
          throw new Error(
            `Error while fetching tickets (Actual Request : - ${this.requestParams.getActualRequest()}) : ${error}`,
          );
        }
      });
  }

  async fetchRecentlyUpdatedTicketsInMovideskApi() {

    Logger.warn(`Fetching tickets from Movidesk API - Skip ${this.requestParams.getActualRequest() * 1000}`);
    
    const apiUrlInUse = this.movidesk.getCompleteUrlOfLastCreatedOrUpdatedTickets();

    return await axios.get(apiUrlInUse).then(async (res) => {
      if (res.data.length === 0) {
        return [];
      }

      res.data = res.data.map((ticket) => {
        if (ticket.id > this.lastTicketId) {
          this.lastTicketId = ticket.id;
          this.pushTicket(ticket);
          return ticket;
        } else if (ticket.id < this.lastTicketId) {
          this.tickets = this.tickets.filter((oldTicket) => {
            if (oldTicket.id === ticket.id) {
              oldTicket = ticket;
            }
            return oldTicket;
          });
        }
      });

      this.requestParams.increaseActualRequestByOne();

      this.movidesk.setTicketsOffSet(
        (this.requestParams.getActualRequest() * 1000).toString(),
      );

      return res.data;
    }).catch(async (error) => {
      console.error('Error while fetching tickets', error);
      if (error.response.status === 500) {
        console.error(
          'Error 500 while fetching tickets, trying again in 5 seconds',
        );
        setTimeout(() => { }, 5000);
        await this.fetchRecentlyUpdatedTicketsInMovideskApi();
      } else {
        throw new Error(
          `Error while fetching tickets (Actual Request : - ${this.requestParams.getActualRequest()}) : ${error}`,
        );
      }
    })
  }

  async fetchAndSaveAllTickets() {
    this.requestParams = new RequestParams(
      0,
      Math.ceil((await this.fetchLatestCreatedTicket()) / 1000),
      1,
    );
    this.movidesk.setTicketsOffSet(
      (this.requestParams.getActualRequest() * 1000).toString(),
    );
    if (this.localFileHandler.checkFileExists() === true) {
      const localFileContent = this.localFileHandler.readLocalFile();
      if (localFileContent.length > 0) {
        this.lastTicketId =
          localFileContent[localFileContent.length - 1].id || 0;
        this.requestParams.setActualRequest(
          Math.ceil(localFileContent[localFileContent.length - 1].id / 1000),
        );
      }
    }
    while (
      true &&
      this.requestParams.getActualRequest() <
      this.requestParams.getMaximumRequest()
    ) {
      const tickets = await this.fetchTicketsInMovideskApi();
      if (
        tickets.length === 0 &&
        this.requestParams.getCurrentApiUrlRoute() == 1
      ) {
        return this.tickets;
      } else {
        this.localFileHandler.setFileContent(tickets.flat());
        this.localFileHandler.appendFile();

        this.tickets.concat(tickets);
      }
    }
  }

  async fetchAllTickets() {

    const maximumRequest = Math.ceil((await this.fetchLatestCreatedTicket()) / 1000);

    this.requestParams = new RequestParams(
      0,
      maximumRequest,
      1,
    );
    this.movidesk.setTicketsOffSet(
      (this.requestParams.getActualRequest() * 1000).toString(),
    );

    if (this.localFileHandler.checkFileExists() === true) {
      const localFileContent = this.localFileHandler.readLocalFile();
      if (localFileContent.length > 0) {
        this.lastTicketId =
          localFileContent[localFileContent.length - 1].id || 0;
        this.requestParams.setActualRequest(
          Math.ceil(this.lastTicketId / 1000),
        );
      }
    }

    while (
      true &&
      this.requestParams.getActualRequest() <
      this.requestParams.getMaximumRequest()
    ) {
      const tickets = await this.fetchTicketsInMovideskApi();
      if (
        (tickets && tickets.length === 0 &&
          this.requestParams.getCurrentApiUrlRoute() == 1) ||
        (this.requestParams.getActualRequest() >=
          this.requestParams.getMaximumRequest() &&
          this.requestParams.getCurrentApiUrlRoute() == 0)
      ) {
        return this.tickets;
      } else {
        continue;
      }
    }
  }

  async fetchRecentlyUpdatedTickets() {

    const maximumRequest = Math.ceil(this.lastTicketId / 1000);

    this.requestParams = new RequestParams(
      0,
      maximumRequest,
      1,
    );

    while (
      true &&
      this.requestParams.getActualRequest() <
      this.requestParams.getMaximumRequest()
    ) {
      const tickets = await this.fetchRecentlyUpdatedTicketsInMovideskApi();

      if (tickets.length === 0) {
        return this.tickets;
      } else {
        continue;
      }
    }
  }
}
