import { RaffleDraw } from 'src/entities';
import { firebaseService } from '../services/firebase.service';
import { Filters, Entity } from './localbase/state-db.controller';
import { Observable } from 'rxjs';
import { CbResponse } from './base.resource';
import { FbBaseResource } from './fb-base.resource';

class RaffleDrawsResource extends FbBaseResource<RaffleDraw> {
  protected streamCb(
    filters?: Filters<Entity> | undefined
  ): void | Observable<RaffleDraw[]> {
    return firebaseService.streamWith<RaffleDraw>(
      'draws',
      (filters && this.arrayFilter(filters)) ||
        (typeof filters == 'object' &&
          (filters as { [key: string]: string })) ||
        {}
    );
  }
  protected async getCb(key: string): Promise<boolean | void | RaffleDraw> {
    return (await firebaseService.get('draws', key)) as RaffleDraw;
  }
  protected async createCb(
    data: RaffleDraw
  ): Promise<boolean | void | RaffleDraw> {
    return (await firebaseService.create('draws', data)) as RaffleDraw;
  }
  protected async deleteCb(
    data: RaffleDraw
  ): Promise<boolean | void | RaffleDraw> {
    await firebaseService.delete('draws', data.id || data.key);
    return true;
  }
  protected async deleteAllCb(): Promise<boolean | void> {
    return true;
  }
  protected async getAllCb(
    filters?: Filters<Entity> | undefined
  ): Promise<void | RaffleDraw[]> {
    return (await firebaseService.findAll(
      'draws',
      filters as { [field: string]: string }
    )) as RaffleDraw[];
  }
  protected async updateCb(
    data: RaffleDraw
  ): Promise<boolean | void | RaffleDraw> {
    await firebaseService.update('draws', data.id || data.key, data);
    return true;
  }
  protected async patchCb(
    data: RaffleDraw,
    property: string
  ): Promise<CbResponse<RaffleDraw>> {
    await firebaseService.patch(
      'draws',
      data.key,
      property,
      data[property as keyof RaffleDraw]
    );
    return true;
  }
  constructor() {
    super('draws');
  }
}
export const raffleDrawsResource = new RaffleDrawsResource();
