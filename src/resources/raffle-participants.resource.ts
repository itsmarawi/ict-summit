import { RaffleParticipant } from 'src/entities';
import { firebaseService } from '../services/firebase.service';
import { Filters, Entity } from './localbase/state-db.controller';
import { Observable } from 'rxjs';
import { CbResponse } from './base.resource';
import { FbBaseResource } from './fb-base.resource';

class RaffleParticipantsResource extends FbBaseResource<RaffleParticipant> {
  getKeyOf(v: RaffleParticipant): string {
    return `${v.draw}:${v.participant.key}`;
  }
  protected streamCb(
    filters?: Filters<Entity> | undefined
  ): void | Observable<RaffleParticipant[]> {
    return firebaseService.streamWith<RaffleParticipant>(
      'participants',
      (filters && this.arrayFilter(filters)) ||
        (typeof filters == 'object' &&
          (filters as { [key: string]: string })) ||
        {}
    );
  }
  protected async getCb(
    key: string
  ): Promise<boolean | void | RaffleParticipant> {
    return (await firebaseService.get(
      'participants',
      key
    )) as RaffleParticipant;
  }
  protected async createCb(
    data: RaffleParticipant
  ): Promise<boolean | void | RaffleParticipant> {
    return (await firebaseService.create(
      'participants',
      data
    )) as RaffleParticipant;
  }
  protected async deleteCb(
    data: RaffleParticipant
  ): Promise<boolean | void | RaffleParticipant> {
    await firebaseService.delete('participants', data.id || data.key);
    return true;
  }
  protected async deleteAllCb(): Promise<boolean | void> {
    return true;
  }
  protected async getAllCb(
    filters?: Filters<Entity> | undefined
  ): Promise<void | RaffleParticipant[]> {
    return (await firebaseService.findAll(
      'participants',
      filters as { [field: string]: string }
    )) as RaffleParticipant[];
  }
  protected async updateCb(
    data: RaffleParticipant
  ): Promise<boolean | void | RaffleParticipant> {
    await firebaseService.update('participants', data.id || data.key, data);
    return true;
  }
  protected async patchCb(
    data: RaffleParticipant,
    property: string
  ): Promise<CbResponse<RaffleParticipant>> {
    await firebaseService.patch(
      'participants',
      data.key,
      property,
      data[property as keyof RaffleParticipant]
    );
    return true;
  }
  constructor() {
    super('participants');
  }
}
export const raffleParticipantsResource = new RaffleParticipantsResource();
