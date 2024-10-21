import { Action } from './action.entity';
import { CustomField } from './customField.entity';
import { Fields } from 'src/database/entities/fields.entity';

export class Ticket {
  public id: number;

  private agent: string;

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

  private duration: number;

  private close_in_first_response: boolean;

  private model: string;

  private family: string;

  private distributor: string;

  private operation: string;

  private actions: any;

  private uf: string;

  private failure: string;

  private urgency: string;

  public customFieldValues: CustomField[] = new Array<CustomField>();

  public fields: Fields[] = new Array<Fields>();

  private statusHistories: any[];

  private currentTeam: string;

  private brand?: string;

  constructor(
    id?: number,
    agent?: string,
    team?: string,
    open_date?: Date,
    close_date?: Date,
    solved_date?: Date,
    status?: string,
    service_1?: string,
    service_2?: string,
    service_3?: string,
    category?: string,
    justification?: string,
    duration?: number,
    close_in_first_response?: boolean,
    model?: string,
    family?: string,
    distributor?: string,
    operation?: string,
    actions?: any,
    uf?: string,
    failure?: string,
    urgency?: string,
    customFieldValues?: any,
    fields?: Fields[],
    statusHistories?: any[],
    currentTeam?: string,
    brand?: string,
  ) {
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
    this.actions = actions;
    this.uf = uf;
    this.failure = failure;
    this.urgency = urgency;
    this.customFieldValues = customFieldValues;
    this.fields = fields;
    this.statusHistories = statusHistories;
    this.currentTeam = currentTeam;
    this.brand = brand;
  }

  async mapFields() {
    const trackedFields = this.getFields();
    if (this.customFieldValues) {
      this.customFieldValues.forEach((field: any) => {
        if (!field || field.items.length === 0) {
          return;
        }

        field = new CustomField(
          field.items,
          field.customFieldId,
          field.customFieldRuleId,
          field.line,
          field.column,
        );

        trackedFields.forEach(async (element) => {

          if (element.id.includes(field.getCustomFieldId().toString())) {
            if (element.name == 'model') {
              const split =
                field.items[0].customFieldItem.split(' -')[0] || null;

              this.setModel(split !== 'Sem produto' ? split : null);
              return;
            }

            if (element.name == 'uf') {
              this.setUf(
                field.getItem()[0].customFieldItem.split(' - ')[0] || null,
              );
              return;
            }

            this[element.name] =
              field.getItem()[0].customFieldItem || null;

            return;
          } else {
            return;
          }
        });

        return;
      });
    }

    return;
  }

  public setCreatorAgentUsingStatusHistoryOrActionsData() {
    const findCreatorFromActions = this.actions.reduce((acc, action) => {
      if (
        action.createdBy &&
        action.createdBy.businessName &&
        (action.createdBy.profileType === 1 ||
          action.createdBy.profileType === 3)
      ) {
        this.agent = action.createdBy.businessName;
      }
      return acc;
    }, null);

    if (
      this.statusHistories &&
      this.statusHistories[0] &&
      this.statusHistories[0].changedBy &&
      this.statusHistories[0].changedBy.profileType &&
      (this.statusHistories[0].changedBy.profileType === 1 ||
        this.statusHistories[0].changedBy.profileType === 3)
    ) {
      this.agent = this.statusHistories[0].changedBy.businessName;

    } else if (this.actions) {
      this.agent = findCreatorFromActions;
    } else {
      this.agent = null;
    }
  }

  public setCreatorTeamUsingStatusHistoryOrActionsData() {

    this.actions.reduce((acc, action) => {
      if (
        action.timeAppointments && action.timeAppointments[0] &&
        (action.createdBy.profileType === 1 ||
          action.createdBy.profileType === 3)
      ) {
        this.team = action.timeAppointments[0].createdByTeam.name;
      }
      return acc;
    }, null);

  }

  public mapTicketActions() {
    if (!this.actions || this.actions.length === 0) return;

    let avaibleActions = this.actions.map((action) => {
      const createdBy = action.createdBy ? action.createdBy : null;

      if (!createdBy || createdBy === null) return;

      const actionId = +action.id;
      const profileType = createdBy.profileType ? createdBy.profileType : null;

      if (!profileType || profileType === null) return;

      const businessName = createdBy.businessName
        ? createdBy.businessName
        : null;
      const createdDate = action.createdDate;

      return new Action(
        actionId,
        this.id,
        businessName,
        new Date(createdDate),
      );
    });

    avaibleActions = avaibleActions.filter((action) => action != null);

    this.actions = avaibleActions;
  }

  public getId(): number {
    return this.id;
  }

  public setId(id: number) {
    this.id = id;
  }

  public getAgent(): string {
    return this.agent;
  }

  public setAgent(agent: string) {
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

  public getDuration(): number {
    return this.duration;
  }

  public setDuration(duration: number) {
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

  public getFields(): Fields[] {
    return this.fields;
  }

  public setFields(fields: Fields[]) {
    this.fields = fields
  }

  public getUrgency(): string {
    return this.urgency;
  }

  public setUrgency(urgency: string) {
    this.urgency = urgency;
  }

  public getActions(): any {
    return this.actions;
  }

  public setActions(actions: any) {
    this.actions = actions;
  }

  public deleteActions() {
    delete this.actions;
  }

  public serCurrentTeam(currentTeam: string) {
    this.currentTeam = currentTeam;
  }

  public getCurrentTeam() {
    return this.currentTeam;
  }

  public deleteCustomFieldValues() {
    delete this.customFieldValues;
  }

  public getStatusHistories(): any[] {
    return this.statusHistories;
  }

  public setStatusHistories(statusHistories: any[]) {
    this.statusHistories = statusHistories;
  }

  public deleteStatusHistories() {
    delete this.statusHistories;
  }

  public deleteFields() {
    delete this.fields;
  }

  public getBrand(): string {
    return this.brand;
  }
}
