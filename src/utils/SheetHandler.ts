import { Field } from "src/tickets/entities/field.entity";
import { Ticket } from "src/tickets/entities/ticket.entity";
import * as fs from 'fs';
import  { WorkBook, WorkSheet, readFile, writeFile, utils } from 'xlsx';

export class SheetHandler{

    private brand: string;

    private path: string = process.env.SHEET_PATH ||'./external_files/tables/';

    private sheet: WorkBook;

    private page: WorkSheet;

    private pageInJson: any;

    private fields: Field[] = new Array<Field>();
    
    private result: Ticket[] = new Array<Ticket>();

    private sheetLength: number = 0;

    constructor(brand: string, fields?: Field[]) {
        
        this.path = `${this.path}${brand}-Tickets.xlsx`;

        brand ? this.brand = brand : this.brand = this.brand;

        fields ? this.fields = fields : this.fields = this.fields;

    }

    public readSheet(): void{
        if (fs.existsSync(this.path)) {
        
            this.sheet = readFile(this.path);
            
            this.page = this.sheet.Sheets[`${this.brand}-Tickets`];

            this.pageInJson = utils.sheet_to_json(this.page);
            this.sheetLength = this.pageInJson[this.pageInJson.length - 1] ? this.pageInJson[this.pageInJson.length - 1].id : 0;

        } else {
                
            console.error('File not found');
    
        }
    };

    public checkHeaderFields(): void{ 
        if (fs.existsSync(this.path)) {
    
            let headerFields = this.pageInJson.reduce((acc, curr) => {
                Object.keys(curr).forEach(key => {

                    if (acc && !acc.includes(key)){
                        acc.push(key);
                    }

                });

                return acc;

            }, []);

            this.fields.forEach(field => { 

                if (field.getName != undefined &&!headerFields.includes(field.getName() && field.getName() !== 'id' && field.getId.length > 0)) {
                    this.sheetLength = 0;

                    console.error(`Field ${field.getName} not found in the sheet`);

                    throw new Error(`Field ${field.getName} not found in the sheet`);
                }

            })

            if (this.sheetLength >= this.pageInJson.length) {

                this.sheetLength = this.pageInJson.length;

            }

        }
    };

    public writeSheet(data): void {

        const sheetData = this.pageInJson && this.pageInJson.length > 0 ? this.pageInJson.concat(data) : data;
        
        const workbook = utils.book_new();

        const worksheet = utils.json_to_sheet(sheetData);

        utils.book_append_sheet(workbook, worksheet, `${this.brand}-Tickets`);

        writeFile(workbook, this.path);

        console.info('Sheet saved');

    }

    public getSheetLength(): number {
        return this.sheetLength;
    }

    public getFields(): Field[] {
        return this.fields;
    }

    public getResult(): Ticket[] {
        return this.result;
    }

    public getPageInJson() {
        return this.pageInJson;
    }

    public setSheetLength(sheetLength: number) {
        this.sheetLength = sheetLength;
    }

    public setFields(fields: Field[]) {
        this.fields = fields;
    }

    public setResult(result: Ticket[]) {
        this.result = result;
    }   
    
}