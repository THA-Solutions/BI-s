import { Injectable } from '@nestjs/common';
import { EndPoint } from './entities/endpoint.entity';
import { MovideskApiHandler } from 'src/utils/MovideskApiHandler';
import { FileHandler } from 'src/utils/FileHandler';

@Injectable()
export class TicketsService {

  private endPointFileHandler: FileHandler;
  private endPoint: EndPoint;
  private newTickets: any[] = [];
  private oldTickets: any[] = [];
  private actionsPerAgent: any[] = [];
  private oldActionsPerAgent: any[] = [];
  private oldTicketsFileHandler: FileHandler;
  private actionsPerAgentFileHandler: FileHandler;
  private movideskApiHandler: MovideskApiHandler;

  constructor() {
    this.endPointFileHandler = new FileHandler('endpoints.json');

    this.oldActionsPerAgent = [];
    this.oldTickets = [];
    this.actionsPerAgent = [];
    this.newTickets = [];

  }

  async findAllByBrand(brand: string, token: string) {
    try {
      this.initializeOldTicketsFileHandler(brand);
      this.oldTickets = this.readOldTickets() || [];

      this.initializeActionsPerAgentFileHandler(brand);
      this.oldActionsPerAgent = this.realdOldActionsPerAgent() || [];

      this.endPoint = new EndPoint(brand, null, token, null, null, null);
      this.endPoint.findEndPointByBrandAndToken(brand, token);

      if (!this.oldTicketsFileHandler.checkFileExists()) {
        this.endPoint.setSkip(0);
      }

      this.initializeMovideskApiHandler();

      this.newTickets = await this.movideskApiHandler.fetchAndMapTickets(this.endPoint.getFields());

      this.actionsPerAgent = this.oldActionsPerAgent.concat(this.movideskApiHandler.getActions().flat());

      this.endPoint.setTeamMembers(this.movideskApiHandler.getTeamMembers());
      
      return await this.writeTicketsFile();
    } catch (error) {
      console.error(error);
      throw new Error('Error while fetching tickets');
    }
  }

  async findActionsPerAgent(brand: string, token: string) { 
    try {
      this.initializeActionsPerAgentFileHandler(brand);
      this.oldActionsPerAgent = this.realdOldActionsPerAgent() || [];

      this.endPoint = new EndPoint(brand, null, token, null, null, null);
      this.endPoint.findEndPointByBrandAndToken(brand, token);

      this.initializeMovideskApiHandler();
      if (this.oldActionsPerAgent.length > 0) {
        this.movideskApiHandler.setUpdate(true);
      } else {
        this.movideskApiHandler.setUpdate(false);
      }
      this.movideskApiHandler.setLastUpdate(this.endPoint.getLastUpdate())
      
      await this.movideskApiHandler.fetchActions()

      this.actionsPerAgent ? this.actionsPerAgent : this.actionsPerAgent = [];

      this.actionsPerAgent = this.oldActionsPerAgent.concat(this.movideskApiHandler.getActions().flat());

      return await this.writeActionsPerAgentFile();
    } catch (error) {
      console.error(error);
      throw new Error('Error while fetching tickets');
    }
  }

  private initializeOldTicketsFileHandler(brand: string) {
    this.oldTicketsFileHandler = new FileHandler(`./external_files/json/Tickets-${brand}.json`);
  }

  private initializeActionsPerAgentFileHandler(brand: string) { 

    this.actionsPerAgentFileHandler = new FileHandler(`./external_files/json/Actions-${brand}.json`);

  }

  private readOldTickets(): any[] {
    this.oldTicketsFileHandler.readLocalFile();
    return this.oldTicketsFileHandler.getFileContent();
  }

  private realdOldActionsPerAgent(): any[] {
    this.actionsPerAgentFileHandler.readLocalFile();
    return this.actionsPerAgentFileHandler.getFileContent();
  }

  private initializeMovideskApiHandler() {
    this.movideskApiHandler = new MovideskApiHandler(
      this.endPoint.getToken(),
      this.endPoint.getUrl(),
      this.endPoint.getUrlFields(),
      +this.endPoint.getSkip() || 0,
      this.oldTickets || [],
      this.endPoint.getTeamMembers(),
      this.oldTickets && this.oldTickets.length > 0 || this.oldActionsPerAgent && this.oldActionsPerAgent.length > 0? true : false,
    );
  }

  private async writeTicketsFile() {
    if (this.shouldMergeTickets()) {

      this.newTickets && this.mergeTickets();
      this.writeActionsPerAgentFile();
      return this.oldTickets;
    } else {
      await this.handleNewTickets();
      await this.updateEndPoints();
      this.writeActionsPerAgentFile();
      return this.newTickets.concat(this.oldTickets);
    }
  }

  private async writeActionsPerAgentFile(content?: any) {
        this.actionsPerAgentFileHandler.setFileContent(this.actionsPerAgent);
    
    this.actionsPerAgent = []
    this.oldActionsPerAgent = []

    await this.updateEndPoints();
    return this.actionsPerAgentFileHandler.writeLocalFile();
  }

  private shouldMergeTickets(): boolean {

    return (
      (this.newTickets === null && this.oldTicketsFileHandler.checkFileExists()) ||
      (this.oldTicketsFileHandler.checkFileExists() && this.oldTickets.length > 0 && this.newTickets[this.newTickets.length - 1] &&
        +this.newTickets[this.newTickets.length - 1].id < +this.oldTickets[this.oldTicketsFileHandler.getFileLength()].id)
    );
  }

  private mergeTickets() {

    for (let i = 0; i < this.newTickets.length - this.oldTicketsFileHandler.getFileLength(); i++) {
      if (!this.oldTickets.includes(this.newTickets[i])) {
        this.oldTickets.push(this.newTickets[i]);
      }
    }
    return;
  }

  private async handleNewTickets() {
    

    if (!this.oldTicketsFileHandler.checkFileExists()) {
      if (this.newTickets && this.newTickets.length > 0) {
        this.oldTicketsFileHandler.setFileContent(this.newTickets);
        this.oldTicketsFileHandler.writeLocalFile();
        this.endPoint.setSkip(+this.newTickets[this.newTickets.length - 1].id || 0);
      } else {
        this.endPoint.setSkip(0);
        this.movideskApiHandler.setSkip(0);
        this.newTickets = await this.movideskApiHandler.fetchAndMapTickets(this.endPoint.getFields());
      }
    } else if (this.newTickets.length > 0) {
      this.endPoint.setSkip(+this.newTickets[this.newTickets.length - 1].id);
      this.oldTickets = this.oldTickets.concat(this.newTickets);
      this.oldTicketsFileHandler.setFileContent(this.oldTickets);
      this.oldTicketsFileHandler.writeLocalFile();
      this.newTickets = this.oldTickets;

      
    }

    this.oldTickets = [];
  }

  private async updateEndPoints() {
    let endPointList = this.endPointFileHandler.readLocalFile();

    this.endPoint.setLastUpdate(new Date());

    delete this.endPoint.endPoints;

    if (Array.isArray(endPointList)) {
      endPointList = endPointList.filter(
        (element) => element.brand !== this.endPoint.getBrand() && element.token !== this.endPoint.getToken(),
      );
      endPointList.push(this.endPoint);
    } else {
      endPointList = [this.endPoint];
    }

    this.endPointFileHandler.setFileContent(endPointList);
    this.endPointFileHandler.writeLocalFile();
  }
}
