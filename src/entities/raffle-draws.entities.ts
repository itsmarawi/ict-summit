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
  default?: boolean;
  participant: IProfile;
}

export interface RafflePrice extends IBaseEntity {
  key: string;
  draw: string;
  price: string;
  status: 'ready' | 'scanned' | 'unclaimed' | 'released';
  scannedBy?: IProfile;
  recipient: IProfile;
  releasedBy?: IProfile;
}

export interface RaffleDrawWithParticipants extends RaffleDraw {
  participants?: number;
  winners?: number;
}
