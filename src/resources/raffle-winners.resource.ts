import { RaffleWinner } from 'src/entities';
import { firebaseService } from '../services/firebase.service';
import { Filters, Entity } from './localbase/state-db.controller';
import { Observable } from 'rxjs';
import { CbResponse } from './base.resource';
import { FbBaseResource } from './fb-base.resource';

class RaffleWinnersResource extends FbBaseResource<RaffleWinner> {
  protected streamCb(
    filters?: Filters<Entity> | undefined
  ): void | Observable<RaffleWinner[]> {
    return firebaseService.streamWith<RaffleWinner>(
      'winners',
      (filters && this.arrayFilter(filters)) ||
        (typeof filters == 'object' &&
          (filters as { [key: string]: string })) ||
        {}
    );
  }
  protected async getCb(key: string): Promise<boolean | void | RaffleWinner> {
    return (await firebaseService.get('winners', key)) as RaffleWinner;
  }
  protected async createCb(
    data: RaffleWinner
  ): Promise<boolean | void | RaffleWinner> {
    return (await firebaseService.create('winners', data)) as RaffleWinner;
  }
  protected async deleteCb(
    data: RaffleWinner
  ): Promise<boolean | void | RaffleWinner> {
    await firebaseService.delete('winners', data.id || data.key);
    return true;
  }
  protected async deleteAllCb(): Promise<boolean | void> {
    return true;
  }
  protected async getAllCb(
    filters?: Filters<Entity> | undefined
  ): Promise<void | RaffleWinner[]> {
    return (await firebaseService.findAll(
      'winners',
      filters as { [field: string]: string }
    )) as RaffleWinner[];
  }
  protected async updateCb(
    data: RaffleWinner
  ): Promise<boolean | void | RaffleWinner> {
    await firebaseService.update('winners', data.id || data.key, data);
    return true;
  }
  protected async patchCb(
    data: RaffleWinner,
    property: string
  ): Promise<CbResponse<RaffleWinner>> {
    await firebaseService.patch(
      'winners',
      data.key,
      property,
      data[property as keyof RaffleWinner]
    );
    return true;
  }
  constructor() {
    super('winners');
  }
}
export const raffleWinnersResource = new RaffleWinnersResource();
