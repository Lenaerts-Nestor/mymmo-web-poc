export interface PersonEndpoint {
  personId: number;
  firstName: string;
  lastName: string;
  profilePictures: any[];
}

export interface PersonInfoProps {
  person: PersonEndpoint;
  personId: string;
  appLang: string;
  translationLang: string;
}
