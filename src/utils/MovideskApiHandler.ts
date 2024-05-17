import axios from 'axios';
import { max } from 'rxjs';
import { Ticket } from 'src/tickets/entities/ticket.entity';

export class MovideskApiHandler {
  private token: string;

  private url: URL;

  private urlFields: string;

  private skip: number;

  private tickets: any[];

  private indexes: number[];

  constructor(token: string, url: URL, urlFields: string, skip: number) {
    this.token = token;
    this.url = url;
    this.urlFields = urlFields;
    this.skip = skip;
    this.tickets = [];
  }

  async fetchTickets() {
    let fetchTickets = [];

    let continueFetching = true;

    while (continueFetching === true) {
      const url = `${this.url}/past?TOKEN=${this.token}&$select=${this.urlFields}&$skip=${this.skip}`;

      const response = await axios.get(url);

      if (response.data.length === 0) {
        this.skip =
          fetchTickets.length > 0
            ? +fetchTickets[fetchTickets.length - 1].id
            : +this.skip;

        await this.fetchRemainingTickets();

        return this.tickets;
      }

      this.skip += 1000;

      this.tickets.push(...response.data);
    }

    return this.tickets;
  }

  private async fetchRemainingTickets() {
    const maxConcurrentRequests = 5;
    let activeRequests = [];
    let errorCount = 0;
    let maxErrorCount = 10; // Configurado para 10 tentativas após o primeiro erro 404
    let lastSuccessfulId = +this.skip - 1;

    while (errorCount < maxErrorCount) {
      while (
        activeRequests.length < maxConcurrentRequests &&
        errorCount < maxErrorCount
      ) {
        const currentSkip = this.skip++;
        let fetchPromise = axios
          .get(`${this.url}?id=${currentSkip}&TOKEN=${this.token}`)
          .then((response) => {
            if (response.data && this.indexes.includes(+currentSkip) === false) {
              if (this.indexes.includes(+currentSkip) === false) {
                this.tickets.push(response.data);
                this.indexes.push(+currentSkip);
              }
              
              lastSuccessfulId = +currentSkip; // Atualiza o último ID bem-sucedido
              errorCount = 0; // Reseta a contagem de erros após um sucesso
            }
          })
          .catch((error) => {
            if (error.response) {
              errorCount++;
              if (errorCount >= maxErrorCount) {
                this.skip = +lastSuccessfulId + 1; // Atualiza skip para o último ID válido
                return this.tickets;
              }
            } else {
              console.error(
                `Error fetching ticket at skip ${currentSkip}: ${error}`,
              );
              errorCount++;
            }
          });

        activeRequests.push(fetchPromise);
      }

      if (activeRequests.length >= maxConcurrentRequests) {
        await Promise.all(activeRequests).then(() => {
          activeRequests = []; // Reseta o array de promessas após todas serem concluídas
        });
      }
    }

    if (errorCount < maxErrorCount) {
      this.skip = +lastSuccessfulId + 1; // Garante que skip esteja correto após o loop
    }
  }

  public async fetchAndMapTickets(fields) {
    let tickets = await this.fetchTickets();
    let mappedTickets = [];

    if (tickets.length === 0) {
      return null;
    }

    tickets.forEach((ticket) => {
      let newTicket = new Ticket(
        ticket.id,
        ticket.owner ? ticket.owner.businessName : null,
        ticket.ownerTeam,
        ticket.createdDate,
        ticket.closedIn,
        ticket.resolvedIn,
        ticket.baseStatus,
        ticket.serviceFirstLevel,
        ticket.serviceSecondLevel,
        ticket.serviceThirdLevel,
        ticket.category,
        ticket.justification,
        ticket.lifeTimeWorkingTime,
        ticket.resolvedInFirstCall,
        ticket.model,
        ticket.family,
        ticket.distributor,
        ticket.operation,
        ticket.uf,
        ticket.failure,
        ticket.urgency,
        ticket.customFieldValues,
        fields,
      );

      newTicket.setCustomFieldValues(ticket.customFieldValues);

      newTicket.mapFields();

      delete newTicket.customFieldValues;
      delete newTicket.fields;

      mappedTickets.push(newTicket);
    });

    this.tickets = mappedTickets.filter((ticket) => ticket !== null);

    return this.tickets;
  }

  public getTickets() {
    return this.tickets;
  }

  public getSkip() {
    return this.skip;
  }

  public setSkip(skip: number) {
    this.skip = +skip;
  }
}
