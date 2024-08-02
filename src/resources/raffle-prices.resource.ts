import { RafflePrice } from 'src/entities';
import { firebaseService } from '../services/firebase.service';
import { Filters, Entity } from './localbase/state-db.controller';
import { Observable } from 'rxjs';
import { CbResponse } from './base.resource';
import { FbBaseResource } from './fb-base.resource';

class RafflePricesResource extends FbBaseResource<RafflePrice> {
  protected streamCb(
    filters?: Filters<Entity> | undefined
  ): void | Observable<RafflePrice[]> {
    return firebaseService.streamWith<RafflePrice>(
      'prices',
      (filters && this.arrayFilter(filters)) ||
        (typeof filters == 'object' &&
          (filters as { [key: string]: string })) ||
        {}
    );
  }
  protected async getCb(key: string): Promise<boolean | void | RafflePrice> {
    return (await firebaseService.get('prices', key)) as RafflePrice;
  }
  protected async createCb(
    data: RafflePrice
  ): Promise<boolean | void | RafflePrice> {
    return (await firebaseService.create('prices', data)) as RafflePrice;
  }
  protected async deleteCb(
    data: RafflePrice
  ): Promise<boolean | void | RafflePrice> {
    await firebaseService.delete('prices', data.id || data.key);
    return true;
  }
  protected async deleteAllCb(): Promise<boolean | void> {
    return true;
  }
  protected async getAllCb(
    filters?: Filters<Entity> | undefined
  ): Promise<void | RafflePrice[]> {
    return (await firebaseService.findAll(
      'prices',
      filters as { [field: string]: string }
    )) as RafflePrice[];
  }
  protected async updateCb(
    data: RafflePrice
  ): Promise<boolean | void | RafflePrice> {
    await firebaseService.update('prices', data.id || data.key, data);
    return true;
  }
  protected async patchCb(
    data: RafflePrice,
    property: string
  ): Promise<CbResponse<RafflePrice>> {
    await firebaseService.patch(
      'prices',
      data.key,
      property,
      data[property as keyof RafflePrice]
    );
    return true;
  }
  constructor() {
    super('prices');
  }
}
export const rafflePricesResource = new RafflePricesResource();
