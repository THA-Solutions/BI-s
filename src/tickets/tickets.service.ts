import { Injectable } from '@nestjs/common';
import { EndPoint } from './entities/endpoint.entity';
import { MovideskApiHandler } from 'src/utils/MovideskApiHandler';
import { FileHandler } from 'src/utils/FileHandler';

@Injectable()
export class TicketsService {
  constructor() {}

  async findAll(brand: string, token: string) {
    try {
      const oldTicketsFileHandler = new FileHandler(
        `./external_files/json/Tickets-${brand}.json`,
      );
      oldTicketsFileHandler.readLocalFile();

      let oldTicketsContent = oldTicketsFileHandler.getFileContent();

      let endPoint: EndPoint = new EndPoint(
        brand,
        null,
        token,
        null,
        null,
        null,
      );
      endPoint.findEndPointByBrandAndToken(brand, token);

      if (oldTicketsFileHandler.checkFileExists() == false) {
        
        endPoint.setSkip(0);

      }

      const endPointfileHandler = new FileHandler('endpoints.json');
      let movideskApiHandler = new MovideskApiHandler(
        endPoint.getToken(),
        endPoint.getUrl(),
        endPoint.getUrlFields(),
        +endPoint.getSkip() || 0,
      );

      let tickets = await movideskApiHandler.fetchAndMapTickets(
        endPoint.getFields(),
      );
   
      if (
        (tickets === null && oldTicketsFileHandler.checkFileExists()) || oldTicketsFileHandler.checkFileExists() && oldTicketsContent.length > 0 &&
        +tickets[tickets.length - 1].id <
          +oldTicketsContent[
            oldTicketsFileHandler.getFileLength()
          ].id
      ) {

        return oldTicketsContent.concat(tickets);
      } else {
        delete endPoint.endPoints;

        if (oldTicketsFileHandler.checkFileExists() === false) {
          if (tickets && tickets.length > 0) {
            oldTicketsFileHandler.setFileContent(tickets);

            oldTicketsFileHandler.writeLocalFile();

            endPoint.setSkip(+tickets[tickets.length - 1].id || 0);
          } else {
            endPoint.setSkip(0);
            movideskApiHandler.setSkip(0);

            tickets = await movideskApiHandler.fetchAndMapTickets(
              endPoint.getFields(),
            );
          }
        } else if (tickets.length > 0) {
          endPoint.setSkip(+tickets[tickets.length - 1].id);

          oldTicketsContent = oldTicketsContent.concat(tickets);

          oldTicketsFileHandler.setFileContent(oldTicketsContent);

          oldTicketsFileHandler.writeLocalFile();
        }

        let endPointList = endPointfileHandler.readLocalFile();

        if (Array.isArray(endPointList)) {
          endPointList = endPointList.filter(
            (element) =>
              element.brand !== endPoint.getBrand() &&
              element.token !== endPoint.getToken(),
          );

          endPointList.push(endPoint);
        } else {
          endPointList = [endPoint];
        }

        endPointfileHandler.setFileContent(endPointList);

        endPointfileHandler.writeLocalFile();

        return tickets;
      }
    } catch (error) {
      console.error(error);
    }
  }
}
