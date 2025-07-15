import { PersonEndpoint } from "./person";

export interface Zone {
  zoneId: number;
  name: string;
  plotId: number;
  isPublic: boolean;
  formattedAddress: string;
  street: string;
  postalCode: string;
  city: string;
  entityCount: number;
  personIds: number[];
}

//endpoint interface for fetching zones
export interface GetZonesByPersonResponse {
  status: number;
  data: {
    zones: Zone[];
    person: PersonEndpoint[];
  };
}

export interface GetZonesByPersonPayload {
  personId: number;
  userId: number;
  langId: string;
}
