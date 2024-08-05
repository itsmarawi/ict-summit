import { IBaseEntity } from './base.entity';
import { IProfile } from './profile.entities';

export interface RaffleDraw extends IBaseEntity {
  name: string;
  key: string;
  date: string;
  summit: string;
  defaultPrices: string[];
  winnerPrices: string[];
  spinning?: boolean;
  status: 'open' | 'running' | 'closed';
  managedBy?: string;
  owner: IProfile;
}

export interface RaffleParticipant extends IBaseEntity {
  key: string;
  draw: string;
  won?: boolean;
  participant: IProfile;
}

export interface RafflePrice extends IBaseEntity {
  key: string;
  draw: string;
  price: string;
  status: 'ready' | 'unclaimed' | 'released';
  recipient: IProfile;
  releasedBy?: IProfile;
}

export interface RaffleDrawWithParticipants extends RaffleDraw {
  participants?: number;
  winners?: number;
}
