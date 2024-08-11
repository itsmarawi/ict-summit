import { IBaseEntity } from './base.entity';

export interface ISummit extends IBaseEntity {
  key: string;
  year: string;
  name: string;
  theme: string;
  cutOff?: string;
  dateStart: string;
  dateEnd: string;
  promoBg?: string;
  slots: number;
  venue?: string;
  slotsPerInstitution?: number;
  status?: boolean;
}

export interface ISpeaker extends IBaseEntity {
  key: string;
  order?: number;
  summit: string;
  fullname: string;
  position: string;
  expertise: string;
  institution?: string;
  companyLogo?: string;
  avatar?: string;
  defaultAvatar?: string;
  status?: boolean;
}
export interface ISponsor extends IBaseEntity {
  key: string;
  order?: number;
  summit: string;
  logo: string;
  background?: string;
  name: string;
  status?: boolean;
  institution?: string;
}
export interface ITopic extends IBaseEntity {
  key: string;
  summit: string;
  schedule: string;
  name: string;
  contents: string[];
  status?: boolean;
}
