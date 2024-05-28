export class Action {
    private id: number;

    private ticket_id: number;

    private agent: string;

    private date: Date;

    constructor(id?: number,ticket_id? :number, agent?: string, date?: Date) {
        this.id = id;
        this.ticket_id = ticket_id;
        this.agent = agent;
        this.date = date;
    }

    public getId(): number {
        return this.id;
    }

    public setId(id: number) {
        this.id = id;
    }

    public getTicket_id(): number {
        return this.ticket_id;
    }

    public setTicket_id(ticket_id: number) {
        this.ticket_id = ticket_id;
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