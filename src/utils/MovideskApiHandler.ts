import axios from "axios";
import { count } from "console";

export class MovideskApiHandler {

    private token: string;

    private url: URL;

    private urlFields: string;

    private skip: number;

    private tickets: any[];

    constructor(token: string, url: URL, urlFields: string, skip: number) {
        this.token = token;
        this.url = url;
        this.urlFields = urlFields;
        this.skip = skip;
        this.tickets = [];
    }   

    async fetchTickets() {
        
        let fetchTickets = []
        
        try {
            
            do {

                const url = `${this.url}/past?TOKEN=${this.token}&$select=${this.urlFields}&$skip=${this.skip}`;
                const response =  await axios.get(url);

                if (response.data.length === 0) {

                    do {

                        this.skip = fetchTickets.length > 0 ? fetchTickets[fetchTickets.length - 1].id : this.skip;
       
                        await this.fetchRemainingTickets();

                        return this.tickets;
                        
                    } while (true);

                }

                this.skip += 1000;
  
                this.tickets = [ ...this.tickets, ...response.data ];

            } while (true);
            
        } catch (error) {

            console.error(error);

        }

        return this.tickets;

    }


private async fetchRemainingTickets() {
    let errorsResult = {
        lastAvailableId: null,
        errorId: 0,
        count: 0
    }

    try {
        while (true) {
     
            try {
                const response = await axios.get(`${this.url}?id=${this.skip}&TOKEN=${this.token}`);
                
                if (response.status === 404) {
                    errorsResult.errorId = this.skip;
                    errorsResult.count++;
                    this.skip++;

                    if (errorsResult.count >= 5) {
                        errorsResult.lastAvailableId = this.skip - 1;
                        this.skip = errorsResult.lastAvailableId;
                        return false;
                    }
                } else {
                    this.tickets = [...this.tickets, response.data];
                    errorsResult.count = 0; // Reset error count on successful response
                    this.skip++; // Continue to next ticket
                }

            } catch (error) {
                if (error.response && error.response.status === 404) {
                    // Handle 404 error without throwing

                    errorsResult.errorId = this.skip;
                    errorsResult.count++;
                    this.skip++;

                    if (errorsResult.count >= 5) {
                        errorsResult.lastAvailableId = this.skip - 1;
                        return errorsResult;
                    }
                } else {
                    // Log and break for unexpected errors
                    console.error(`Unexpected error at skip ${this.skip}:`);
                    return errorsResult;
                }
            }
        }
    } catch (error) {
        console.error("Unexpected error:", error);
    }
}

    public getTickets() {
        return this.tickets;
    }

    public getSkip() {
        return this.skip;
    }

}