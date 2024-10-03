interface StatusHistory {
  changedBy: {
    id: string;
    personType: number;
    profileType: number;
    businessName: string;
    email: string;
    phone: string;
    pathPicture: string;
  } | null;
  status: string;
  justification: string | null;
  changedDate: string;
  permanencyTimeFullTime: number | null;
  permanencyTimeWorkingTime: number | null;
}

interface CustomFieldItem {
  personId: string | null;
  clientId: string | null;
  team: string | null;
  customFieldItem: string;
  storageFileGuid: string;
  fileName: string | null;
}

interface CustomFieldValue {
  items: CustomFieldItem[];
  customFieldId: number;
  customFieldRuleId: number;
  line: number;
  value: string | null;
}

interface Owner {
  id: string;
  personType: number;
  profileType: number;
  businessName: string;
  email: string;
  phone: string;
  pathPicture: string;
}

export default interface TicketResponse {
  resolvedInFirstCall: boolean;
  closedIn: string;
  resolvedIn: string;
  createdDate: string;
  serviceThirdLevel: string | null;
  serviceSecondLevel: string | null;
  serviceFirstLevel: string | null;
  urgency: string;
  baseStatus: string;
  lifeTimeWorkingTime: number;
  category: string | null;
  justification: string | null;
  ownerTeam: string;
  id: number;
  actions: any;
  owner: Owner;
  statusHistories: StatusHistory[];
  customFieldValues: CustomFieldValue[];
}
