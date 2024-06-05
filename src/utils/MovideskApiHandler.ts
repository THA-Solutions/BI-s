import axios from 'axios';
import { Action } from 'src/tickets/entities/action.entity';
import { Ticket } from 'src/tickets/entities/ticket.entity';

export class MovideskApiHandler {
  private token: string;

  private url: URL;

  private urlFields: string;

  private skip: number;

  private tickets: any[];

  private indexes: number[] = [];

  private alreadyCountedActionId: any[] = [];

  private actions: any[] = [];

  private oldActionsByDate: any[] = [];

  private teamMembers: any[] = [];
  
  private update: boolean = false;

  private last_update: string;

  constructor(token: string, url: URL, urlFields: string, skip: number,tickets: Ticket[], teamMembers: any[],update: boolean = false) {
    this.token = token;
    this.url = url;
    this.urlFields = urlFields;
    this.skip = skip;
    this.tickets = tickets;
    this.teamMembers = teamMembers || [];
    this.update = update;

    this.indexes = tickets.map((ticket) => ticket.id);
  }

  async fetchTickets() {
    let fetchTickets = [];

    let continueFetching = true;

    while (continueFetching === true) {
      const url = `${this.url}/past?TOKEN=${this.token}&$select=${this.urlFields}&$skip=${this.skip}`;
      const response = await axios.get(url).catch((error) => {
        console.error(`Error fetching tickets at skip ${this.skip}: ${error}`);
        return { data: [] };
      }
      );
      if (response.data.length === 0) {

        if (this.update == false) {
          this.fetchRemainingTickets();
        } else {
          this.skip =
            fetchTickets.length > 0
              ? +fetchTickets[fetchTickets.length - 1].id
              : +this.skip;

          await this.fetchRemainingTicketsIndividually();

        }
        return this.tickets;
      }

      this.skip += 1000;

      this.tickets.push(...response.data);
    }

    return this.tickets;
  }

  private async fetchRemainingTickets() {
    this.setSkip(0);
    const url = `${this.url}/?TOKEN=${this.token}&$select=${this.urlFields}&$skip=${this.skip}`;

    while (true) {
    
      const response = await axios.get(url);

      if (response.data.length === 0) {
        this.skip =
          this.tickets.length > 0
            ? +this.tickets[this.tickets.length - 1].id
            : +this.skip;

        await this.fetchRemainingTicketsIndividually();
        return this.tickets;
      }

      this.skip += 1000;

      this.tickets.push(...response.data);
    }
  }

  private async fetchRemainingTicketsIndividually(url?: string) {
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
          .get(url || `${this.url}?id=${currentSkip}&TOKEN=${this.token}`)
          .then((response) => {
            if (response.data && this.indexes.includes(+currentSkip) === false ) {
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

    if (tickets.length === 0 || tickets === null) return;

    let mappedTicketsPromises = tickets.map(async (ticket) => {
        let agent;
        let firstAction;

      if (!this.indexes.includes(ticket.id)) {
        if (ticket.actions) {
              
              firstAction = ticket.actions[0] || [];
              
              if (ticket.statusHistories) {
                if (ticket.statusHistories[0] && ticket.statusHistories[0].changedBy && ticket.statusHistories[0].changedBy.profileType && (ticket.statusHistories[0].changedBy.profileType === 1 || ticket.statusHistories[0].changedBy.profileType === 3)) {
                  agent = ticket.statusHistories[0].changedBy.businessName;
                } else {
                  agent = ticket.actions.reduce((acc, action) => {
                    if (action.createdBy && action.createdBy.businessName && (action.createdBy.profileType === 1 || action.createdBy.profileType === 3)) {
                      return action.createdBy.businessName;
                    }
                    return acc;
                  }, null);
                }
              } else {
                agent = ticket.actions.reduce((acc, action) => {
                    if (action.createdBy && action.createdBy.businessName && (action.createdBy.profileType === 1 || action.createdBy.profileType === 3)) {
                        return action.createdBy.businessName;
                    }
                    return acc;
                }, null);
              }
                
             

            } else {
                agent = ticket.owner && ticket.owner.businessName ? ticket.owner.businessName : null;
            }

            let newTicket = new Ticket(
                +ticket.id,
                agent,
                firstAction && firstAction.timeAppointments && firstAction.timeAppointments[0] && firstAction.timeAppointments[0].createdByTeam
                ? firstAction.timeAppointments[0].createdByTeam.name
                : null,
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
                ticket.actions,
                ticket.uf,
                ticket.failure,
                ticket.urgency,
                ticket.customFieldValues,
                fields,
            );

            newTicket.setCustomFieldValues(ticket.customFieldValues);

            await newTicket.mapFields();

            newTicket.setActions(await this.getActionQuantityByAgent(ticket.id, ticket.actions, agent));

            delete newTicket.customFieldValues;
            delete newTicket.fields;
            newTicket.deleteActions();

            return newTicket;
        }
    });

    let mappedTickets = await Promise.all(mappedTicketsPromises);

    this.tickets = mappedTickets.filter(ticket => ticket !== null && ticket !== undefined && ticket.id);
    return this.tickets;
}


public async fetchActions() { 
    
    if (this.teamMembers.length === 0) {
        return null;
    }

    const result = [];

  for (const teamMember of this.teamMembers) {

    let continueFetching = true;
    let errorCount = 0;
    const maxErrorCount = 1;
    this.skip = 0;
    if(teamMember != "Guilherme TI ")
        while (continueFetching === true) {
          try {
            let url = this.update ? `${this.url}/past?TOKEN=${this.token}&$select=id&$expand=actions($expand=createdBy)&$filter=actions/any(b:b/createdBy/businessName eq '${teamMember}') and lastActionDate gt ${this.last_update}&$skip=${this.skip}` : `${this.url}/past?TOKEN=${this.token}&$select=id&$expand=actions($expand=createdBy)&$filter=actions/any(b:b/createdBy/businessName eq '${teamMember}')&$skip=${this.skip}` 

            let response = await axios.get(url)
            
            if (response.data.length === 0) {
                while (errorCount < maxErrorCount ){

                  this.skip++
                  response = await axios.get(`${this.url}/past?TOKEN=${this.token}&$select=id&$expand=actions($expand=createdBy)&$filter=actions/any(b:b/createdByTeam/name eq '${teamMember}')&$skip=${this.skip}`);
                    
                  if (response.data.length === 0) {

                    errorCount++;
                    
                    if (errorCount >= maxErrorCount) {
                    
                      continueFetching = false;
                      
                      return result;
                      
                    }
                  
                  }

                  response.data.forEach(async (ticket) => {
                    await this.getActionQuantityByAgent(ticket.id, ticket.actions, teamMember)
                  });
              }
              
            } else {

              response.data.forEach(async (ticket) => {
              await this.getActionQuantityByAgent(ticket.id, ticket.actions, teamMember)
              });
              this.skip += 1000;
            }

            errorCount = 0;

            } catch (error) {
                if (error.response) {
                    errorCount++;
                    if (errorCount >= maxErrorCount) {
                        continueFetching = false;
                    }
                } else {
                    console.error(`Error fetching actions for team member ${teamMember} at skip ${this.skip}: ${error}`);
                    errorCount++;
                }
            }
        }
    }

    return result;
}

  public async getActionQuantityByAgent(id, actions: any[], teamMember: string) { 

    if (!actions || actions.length === 0) return;

    actions.forEach((action) => { 
      const profileType = action.createdBy ? action.createdBy.profileType : null;

      const id_action = +action.id;
      const businessName = action.createdBy ? action.createdBy.businessName : null;
      const date = action.createdDate;

      if (profileType === 1 && this.alreadyCountedActionId.includes(action.id) === false && businessName === teamMember) {

        const newAction = new Action(
          id_action,
          +id,
          businessName,
          date
        )

              if (this.teamMembers.includes(businessName) === false && ["Guilherme TI "].includes(businessName) === false){

                  this.teamMembers.push(businessName);

              }

        this.alreadyCountedActionId.push(action.id);

        this.pushActions(newAction);
      }

    })
    this.alreadyCountedActionId = [];
    return this.getActions();
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

  public getTeamMembers() {
    return this.teamMembers;
  }

  public setTeamMembers(teamMembers: any[]) {
    this.teamMembers = teamMembers;
  }

  public getActions() {
    return this.actions;
  }

  public pushActions(actions: any | any[]) {
    if(Array.isArray(actions)){
      this.actions.push(...actions);
    }
    else {
      this.actions.push(actions);
    }
  }

  public setActions(actions: any[]) {
    this.actions = actions;
  }

  public getOldActionsByDate() {
    return this.oldActionsByDate;
  }

  public setOldActionsByDate(oldActionsByDate: any[]) {
    this.oldActionsByDate = oldActionsByDate;
  }

  public pushOldActionsByDate(oldActionsByDate: any[]) {
    this.oldActionsByDate.push(...oldActionsByDate);
  }

  public setLastUpdate(last_update: string) {
    this.last_update = last_update;
  }

  public getLastUpdate() {
    return this.last_update;
  }

  public setUpdate(update: boolean) {
    this.update = update;
  }
}
