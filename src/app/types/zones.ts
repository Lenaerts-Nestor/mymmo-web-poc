export interface ZoneCardProps {
  zone: Zone;
}

export interface ZonesListProps {
  zones: Zone[];
  isLoading: boolean;
  search?: string;
}
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
