import { IBaseEntity } from './base.entity';

export interface IMedia extends IBaseEntity {
  key: string;
  type: 'audio' | 'doc' | 'image' | 'video',
  dataUrl: string;
}
