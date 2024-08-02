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
  status: 'open' | 'closed';
  owner: IProfile;
}

export interface RaffleParticipant extends IBaseEntity {
  key: string;
  draw: string;
  participant: IProfile;
}

export interface RaffleWinner extends IBaseEntity {
  key: string;
  draw: string;
  winner: IProfile;
}

export interface RafflePrice extends IBaseEntity {
  key: string;
  draw: string;
  price: string;
  status: 'ready' | 'unclaimed' | 'released';
  recipient: IProfile;
  releasedBy?: IProfile;
}
