export class Action {
  private id: number;

  private ticketId: number;

  private agent: string;

  private date: Date;

  constructor(id?: number, ticketId?: number, agent?: string, date?: Date) {
    this.id = id;
    this.ticketId = ticketId;
    this.agent = agent;
    this.date = date;
  }

  public getId(): number {
    return this.id;
  }

  public setId(id: number) {
    this.id = id;
  }

  public getTicketId(): number {
    return this.ticketId;
  }

  public setTicketId(ticket_id: number) {
    this.ticketId = ticket_id;
  }

  public getAgent(): string {
    return this.agent;
  }

  public setAgent(agent: string) {
    this.agent = agent;
  }

  public getDate(): Date {
    return this.date;
  }

  public setDate(date: Date) {
    this.date = date;
  }
}
