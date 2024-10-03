export class CustomField {
  public items: any[];

  public customFieldId: number;

  public customFieldRuleId: number;

  private line: number;

  private column: string;

  constructor(
    items: any[],
    customFieldId: number,
    customFieldRuleId: number,
    line: number,
    value: string,
  ) {
    this.items = items;

    this.customFieldId = customFieldId;

    this.customFieldRuleId = customFieldRuleId;

    this.line = line;

    this.column = value;
  }

  public getItem(): CustomFieldItem[] {
    return this.items;
  }

  public setItem(items: CustomFieldItem[]) {
    this.items = items;
  }

  public getCustomFieldId(): number {
    return this.customFieldId;
  }

  public setCustomFieldId(customFieldId: number) {
    this.customFieldId = customFieldId;
  }

  public getCustomFieldRuleId(): number {
    return this.customFieldRuleId;
  }

  public setCustomFieldRuleId(customFieldRuleId: number) {
    this.customFieldRuleId = customFieldRuleId;
  }

  public getLine(): number {
    return this.line;
  }

  public setLine(line: number) {
    this.line = line;
  }

  public getColumn(): string {
    return this.column;
  }

  public setColumn(column: string) {
    this.column = column;
  }
}

export class CustomFieldItem {
  private personId: number;

  private clientId: number;

  private team: string;

  public customFieldItem: string;

  private storageFileGuid: string;

  private fileName: string;

  public getPersonId(): number {
    return this.personId;
  }

  public setPersonId(personId: number) {
    this.personId = personId;
  }

  public getClientId(): number {
    return this.clientId;
  }

  public setClientId(clientId: number) {
    this.clientId = clientId;
  }

  public getTeam(): string {
    return this.team;
  }

  public setTeam(team: string) {
    this.team = team;
  }

  public getCustomFieldItem(): string {
    return this.customFieldItem;
  }

  public setCustomFieldItem(customFieldItem: string) {
    this.customFieldItem = customFieldItem;
  }

  public getStorageFileGuid(): string {
    return this.storageFileGuid;
  }

  public setStorageFileGuid(storageFileGuid: string) {
    this.storageFileGuid = storageFileGuid;
  }

  public getFileName(): string {
    return this.fileName;
  }

  public setFileName(fileName: string) {
    this.fileName = fileName;
  }
}
