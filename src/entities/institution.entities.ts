import { IBaseEntity } from './base.entity';

export interface IInstitution extends IBaseEntity {
  key: string; // institution code
  name: string;
  telephone: string;
  address: string;
  email: string;
  status: boolean;
}
