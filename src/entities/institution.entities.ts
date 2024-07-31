import { IBaseEntity } from './base.entity';

export interface IInstitution extends IBaseEntity {
  key: string; // institution code
  name: string;
  sector: 'government' | 'private';
}
