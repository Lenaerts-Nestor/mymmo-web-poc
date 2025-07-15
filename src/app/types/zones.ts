import { Zone } from "./apiEndpoints";

export interface ZoneCardProps {
  zone: Zone;
}

export interface ZonesListProps {
  zones: Zone[];
  isLoading: boolean;
}
