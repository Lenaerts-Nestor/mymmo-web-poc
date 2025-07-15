// src/types/apiEndpoints.ts

import { PersonEndpoint } from "./person";

// ===== COMMON API RESPONSE WRAPPER =====
export interface ApiResponseWrapper<T> {
  status: number;
  data: T;
}

// ===== PROPERTY INTERFACES =====
export interface PropertyItem {
  propertyId: number;
  name: string;
  address: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetAllPropertiesPayload {
  personId: number;
  langId: string;
}

export interface GetAllPropertiesResponse
  extends ApiResponseWrapper<{
    properties: PropertyItem[];
  }> {}

export interface GetActivePropertiesPayload {
  personId: number;
  langId: string;
}

export interface GetActivePropertiesResponse
  extends ApiResponseWrapper<{
    properties: PropertyItem[];
  }> {}

// ===== ZONES LIST INTERFACES =====
export interface GetZonesListPayload {
  latitude?: number;
  longitude?: number;
  radius?: number;
  langId: string;
  personId?: number;
}
export interface GetZonesByPersonPayload {
  personId: number;
  userId: number;
  langId: string;
}
export interface GetZonesListResponse
  extends ApiResponseWrapper<{
    zones: Zone[];
  }> {}

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
// ===== ZONE MANAGEMENT INTERFACES =====
export interface CreateZonePayload {
  name: string;
  plotId: number;
  isPublic: boolean;
  street: string;
  postalCode: string;
  city: string;
  personId: number;
  langId: string;
  latitude?: number;
  longitude?: number;
}

export interface CreateZoneResponse
  extends ApiResponseWrapper<{
    zoneId: number;
    message: string;
  }> {}

export interface UpdateZonePayload {
  zoneId: number;
  name?: string;
  isPublic?: boolean;
  personId: number;
  langId: string;
  street?: string;
  postalCode?: string;
  city?: string;
}

export interface UpdateZoneResponse
  extends ApiResponseWrapper<{
    zoneId: number;
    message: string;
  }> {}

// ===== PERSON MANAGEMENT INTERFACES =====
export interface CreatePersonPayload {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  langId: string;
  password?: string;
}

export interface CreatePersonResponse
  extends ApiResponseWrapper<{
    personId: number;
    message: string;
  }> {}

export interface UpdatePersonPayload {
  personId: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  langId: string;
}

export interface UpdatePersonResponse
  extends ApiResponseWrapper<{
    personId: number;
    message: string;
  }> {}

export interface DeletePersonAccountPayload {
  personId: number;
  langId: string;
  confirmationCode?: string;
}

export interface DeletePersonAccountResponse
  extends ApiResponseWrapper<{
    message: string;
  }> {}

// ===== OTP INTERFACES =====
export interface SendOtpPayload {
  phoneNumber: string;
  langId: string;
  purpose?: string;
}

export interface SendOtpResponse
  extends ApiResponseWrapper<{
    message: string;
    otpId: string;
    expiresAt: string;
  }> {}

export interface VerifyOtpPayload {
  phoneNumber: string;
  otpCode: string;
  langId: string;
  otpId?: string;
}

export interface VerifyOtpResponse
  extends ApiResponseWrapper<{
    isValid: boolean;
    message: string;
    token?: string;
  }> {}

// ===== COMMUNICATION GROUP INTERFACES =====
export interface CommunicationGroupItem {
  groupId: number;
  name: string;
  description?: string;
  memberIds: number[];
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface CreateCommunicationGroupPayload {
  name: string;
  description?: string;
  memberIds: number[];
  createdBy: number;
  langId: string;
}

export interface CreateCommunicationGroupResponse
  extends ApiResponseWrapper<{
    groupId: number;
    message: string;
  }> {}

export interface UpdateCommunicationGroupPayload {
  groupId: number;
  name?: string;
  description?: string;
  memberIds?: number[];
  updatedBy: number;
  langId: string;
}

export interface UpdateCommunicationGroupResponse
  extends ApiResponseWrapper<{
    groupId: number;
    message: string;
  }> {}
