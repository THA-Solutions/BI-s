import { BusinessDate } from '../../utils/businessDate';

export class Movidesk {
  private businessDate: BusinessDate;

  private lastTicketUpdateDate: string;

  private baseUrl: string;

  private movideskApiToken: string;

  private fieldsToFetch: string;

  private ticketsOffSet: string;

  private brand: string;

  constructor(
    baseUrl: string,
    movideskApiToken: string,
    fieldsToFetch: string,
    ticketsOffSet: string,
    brand: string,
    lastTicketUpdateDate?: string,
  ) {
    this.baseUrl = baseUrl;
    this.movideskApiToken = movideskApiToken;
    this.fieldsToFetch = fieldsToFetch;
    this.ticketsOffSet = ticketsOffSet;
    this.brand = brand;
    this.lastTicketUpdateDate = lastTicketUpdateDate;

    this.businessDate = new BusinessDate();
  }

  public setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  public getBaseUrl() {
    return this.baseUrl;
  }

  public setMovideskApiToken(token: string) {
    this.movideskApiToken = token;
  }

  public getMovideskApiToken() {
    return this.movideskApiToken;
  }

  public setTicketsOffSet(ticketsOffSet: string) {
    this.ticketsOffSet = ticketsOffSet;
  }

  public getTicketsOffSet() {
    return this.ticketsOffSet;
  }

  public setBrand(brand: string) {
    this.brand = brand;
  }

  public getBrand() {
    return this.brand;
  }

  public setFieldsToFetch(fieldsToFetch: string) {
    this.fieldsToFetch = fieldsToFetch;
  }

  public getFieldsToFetch() {
    return this.fieldsToFetch;
  }

  public setLastTicketUpdateDate(lastUpdateTicketDate: string) {
    this.lastTicketUpdateDate = lastUpdateTicketDate;
  }

  public getLastTicketUpdateDate() {
    return this.lastTicketUpdateDate;
  }

  public getCompleteApiUrl() {
    return `${this.baseUrl}?TOKEN=${this.movideskApiToken}&$select=${this.fieldsToFetch}`;
  }

  public getCompletePastTicketsApiUrl() {
    return `${this.baseUrl}/past?TOKEN=${this.movideskApiToken}&$select=${this.fieldsToFetch}&$skip=${this.ticketsOffSet}`;
  }

  public getCompleteRecentlyUpdatedTicketsApiUrl() {
    return `${this.getCompleteApiUrl()}&$skip=${this.ticketsOffSet}`;
  }

  public getCompleteUrlOfLastCreatedOrUpdatedTickets() {
    return `${this.getCompleteApiUrl()}&$filter=createdDate gt ${this.lastTicketUpdateDate} or lastActionDate gt ${this.lastTicketUpdateDate}&$skip=${this.ticketsOffSet}`;
  }

  public getCompleteUrlOfLastCreatedTicket() {
    return `${this.getCompleteApiUrl()}&$filter=createdDate gt ${this.businessDate.getStartHour().toISOString()}`;
  }
}
