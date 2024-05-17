import { CustomField } from "./customField.entity";
import { Field } from "./field.entity";
import { Owner } from "./owner.entity";

export class Ticket{

    private id: number;
    
    private agent: Owner;

    private team: string;

    private open_date: Date;

    private close_date: Date;

    private solved_date: Date;

    private status: string;

    private service_1: string;

    private service_2: string;

    private service_3: string;

    private category: string;

    private justification: string;

    private duration: string;

    private close_in_first_response: boolean;

    private model: string;

    private family: string;

    private distributor: string;

    private operation: string;

    private uf: string;

    private failure: string;

    private urgency: string;

    public customFieldValues: CustomField[] = new Array<CustomField>();

    public fields: Field[] = new Array<Field>();

    constructor( id?: number, agent?: Owner, team?: string, open_date?: Date, close_date?: Date, solved_date?: Date, status?: string, service_1?: string, service_2?: string, service_3?: string, category?: string, justification?: string, duration?: string, close_in_first_response?: boolean, model?: string, family?: string, distributor?: string, operation?: string, uf?: string, failure?: string, urgency?: string, customFieldValues?:any, fields?: Field[]) {
        this.id = id;
        this.agent = agent;
        this.team = team;
        this.open_date = open_date;
        this.close_date = close_date;
        this.solved_date = solved_date;
        this.status = status;
        this.service_1 = service_1;
        this.service_2 = service_2;
        this.service_3 = service_3;
        this.category = category;
        this.justification = justification;
        this.duration = duration;
        this.close_in_first_response = close_in_first_response;
        this.model = model;
        this.family = family;
        this.distributor = distributor;
        this.operation = operation;
        this.uf = uf;
        this.failure = failure;
        this.urgency = urgency;
        this.customFieldValues = customFieldValues;
        this.fields = fields;
    }

    async mapFields() {
        let trackedFields = this.getFields();
        if(this.customFieldValues){

        this.customFieldValues.forEach( (field : any) => {

            if (!field || field.items.length === 0) {
                return;
            }

            field = new CustomField(field.items, field.customFieldId, field.customFieldRuleId, field.line, field.column);
            
            trackedFields.forEach(async element => {
                element = new Field(element.id, element.name);

                if (element.getId().includes(field.getCustomFieldId().toString())) {
                    
                    if (element.getName() == "model") {
                        
                        let split = field.items[0].customFieldItem.split(" -")[0] || null;
        
                        this.setModel(split !== 'Sem produto' ? split : null);
                            return;
                        }

                    if (element.getName() == "uf") {

                            this.setUf(field.getItem()[0].customFieldItem.split(" - ")[0] || null);
                            return;
                    }

                    this[element.getName()] = field.getItem()[0].customFieldItem || null;

                    return;
                }
            });

            return;
        })}
        
        return
    }

    public getId(): number {
        return this.id;
    }

    public setId(id: number) {
        this.id = id;
    }

    public getAgent(): Owner {
        return this.agent;
    }

    public setAgent(agent: Owner) {
        this.agent = agent;
    }

    public getTeam(): string {
        return this.team;
    }

    public setTeam(team: string) {
        this.team = team;
    }

    public getOpen_date(): Date {
        return this.open_date;
    }

    public setOpen_date(open_date: Date) {
        this.open_date = open_date;
    }

    public getClose_date(): Date {
        return this.close_date;
    }

    public setClose_date(close_date: Date) {
        this.close_date = close_date;
    }
    
    public getSolved_date(): Date {
        return this.solved_date;
    }

    public setSolved_date(solved_date: Date) {
        this.solved_date = solved_date;
    }

    public getStatus(): string {
        return this.status;
    }

    public setStatus(status: string) {
        this.status = status;
    }

    public getService_1(): string {
        return this.service_1;
    }

    public setService_1(service_1: string) {
        this.service_1 = service_1;
    }

    public getService_2(): string {
        return this.service_2;
    }

    public setService_2(service_2: string) {
        this.service_2 = service_2;
    }

    public getService_3(): string {
        return this.service_3;
    }

    public setService_3(service_3: string) {
        this.service_3 = service_3;
    }

    public getCategory(): string {
        return this.category;
    }

    public setCategory(category: string) {
        this.category = category;
    }

    public getJustification(): string {
        return this.justification;
    }

    public setJustification(justification: string) {
        this.justification = justification;
    }

    public getDuration(): string {
        return this.duration;
    }

    public setDuration(duration: string) {
        this.duration = duration;
    }

    public getClose_in_first_response(): boolean {
        return this.close_in_first_response;
    }

    public setClose_in_first_response(close_in_first_response: boolean) {
        this.close_in_first_response = close_in_first_response;
    }

    public getModel(): string {
        return this.model;
    }

    public setModel(model: string) {
        this.model = model;
    }

    public getFamily(): string {
        return this.family;
    }

    public setFamily(family: string) {
        this.family = family;
    }

    public getDistributor(): string {
        return this.distributor;
    }

    public setDistributor(distributor: string) {
        this.distributor = distributor;
    }

    public getOperation(): string {
        return this.operation;
    }

    public setOperation(operation: string) {
        this.operation = operation;
    }

    public getUf(): string {
        return this.uf;
    }

    public setUf(uf: string) {
        this.uf = uf;
    }

    public getFailure(): string {
        return this.failure;
    }

    public setFailure(failure: string) {
        this.failure = failure;
    }

    public getCustomFieldValues(): CustomField[] {
        return this.customFieldValues;
    }

    public setCustomFieldValues(customFieldValues: CustomField[]) {
        this.customFieldValues = customFieldValues;
    }

    public getFields(): Field[] {
        return this.fields;
    }

    public setFields(fields: Field[]) {
        this.fields = fields.map(field => {
            return new Field(field.id, field.name);
        });
    }

    public getUrgency(): string {
        return this.urgency;
    }

    public setUrgency(urgency: string) {
        this.urgency = urgency;
    }
}
