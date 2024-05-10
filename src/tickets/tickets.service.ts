import { Injectable } from '@nestjs/common';
import { EndPoint } from './entities/endpoint.entity';
import { MovideskApiHandler } from 'src/utils/MovideskApiHandler';
import { SheetHandler } from 'src/utils/SheetHandler';
import { FileHandler } from 'src/utils/FileHandler';
import { Ticket } from './entities/ticket.entity';

@Injectable()
export class TicketsService {

  constructor(
  ) {}

  async findAll(brand: string, token: string) {
    try {

      const oldTicketsFileHandler = new FileHandler(`./external_files/json/Tickets-${brand}.json`);
        oldTicketsFileHandler.readLocalFile();

      let endPoint: EndPoint = new EndPoint(brand, null, token, null, null, null);
        endPoint.findEndPointByBrandAndToken(brand, token);
    
      const endPointfileHandler = new FileHandler('endpoints.json');
        let movideskApiHandler = new MovideskApiHandler(endPoint.getToken(), endPoint.getUrl(), endPoint.getUrlFields(), endPoint.getSkip() || 0);
        let tickets = await movideskApiHandler.fetchTickets();


      console.log(tickets.length, tickets[tickets.length - 1], oldTicketsFileHandler.getFileLength(), oldTicketsFileHandler[oldTicketsFileHandler.getFileLength()])
      if (tickets.length === 0 && tickets[tickets.length - 1] && oldTicketsFileHandler.getFileLength() && tickets[tickets.length - 1].id <= oldTicketsFileHandler[oldTicketsFileHandler.getFileLength()].id) {

        return oldTicketsFileHandler.getFileContent();

      } else {

      
        tickets = tickets.map((ticket) => {

          if (!ticket /* || (ticket.serviceFirstLevel == null && ticket.serviceSecondLevel == null && ticket.serviceThirdLevel == null && ticket.justification !== 'Retorno do cliente')*/) {
            return null;
          };
          
          let newTicket = new Ticket(ticket.id, ticket.owner ? ticket.owner.businessName : null, ticket.ownerTeam, ticket.createdDate, ticket.closedIn, ticket.resolvedIn, ticket.baseStatus, ticket.serviceFirstLevel, ticket.serviceSecondLevel, ticket.serviceThirdLevel, ticket.category, ticket.justification, ticket.lifeTimeWorkingTime, ticket.resolvedInFirstCall, ticket.model, ticket.family, ticket.distributor, ticket.operation, ticket.uf, ticket.failure, ticket.urgency, ticket.customFieldValues, endPoint.getFields())

          delete newTicket.customFieldValues;
  
          delete newTicket.fields;
      
          return newTicket;

        })

        tickets = tickets.filter((ticket) => ticket !== null);
  
        delete endPoint.endPoints;
        
        if ( !oldTicketsFileHandler.checkFileExists()){
        endPoint.setSkip(0);
        } else if (tickets.length > 0){
          endPoint.setSkip(tickets[tickets.length - 1].id);
        } 
  
        let endPointList = endPointfileHandler.readLocalFile();
  
        
  
        if (Array.isArray(endPointList)) {

          endPointList = endPointList.filter((element) => element.brand !== endPoint.getBrand() && element.token !== endPoint.getToken())
        
          endPointList.push(endPoint);

        }

        endPointfileHandler.setFileContent(endPointList);

        endPointfileHandler.writeLocalFile();

        if (tickets.length > 0) {
          oldTicketsFileHandler.setFileContent(tickets);

          oldTicketsFileHandler.writeLocalFile();
        }

        

        return tickets;
        
      }

    } catch (error) {

      console.error(error);

    }

  }

}
