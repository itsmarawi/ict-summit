import { ISponsor } from 'src/entities';
import { firebaseService } from '../services/firebase.service';
import { Filters, Entity } from './localbase/state-db.controller';
import { Observable } from 'rxjs';
import { CbResponse } from './base.resource';
import { FbBaseResource } from './fb-base.resource';

const ENTITY = 'sponsors';
class SponsorsResource extends FbBaseResource<ISponsor> {
  protected streamCb(
    filters?: Filters<Entity> | undefined
  ): void | Observable<ISponsor[]> {
    return firebaseService.streamWith<ISponsor>(
      ENTITY,
      (filters && this.arrayFilter(filters)) ||
        (typeof filters == 'object' &&
          (filters as { [key: string]: string })) ||
        {}
    );
  }
  protected async getCb(key: string): Promise<boolean | void | ISponsor> {
    return (await firebaseService.get(ENTITY, key)) as ISponsor;
  }
  protected async createCb(data: ISponsor): Promise<boolean | void | ISponsor> {
    return (await firebaseService.create(ENTITY, data)) as ISponsor;
  }
  protected async deleteCb(data: ISponsor): Promise<boolean | void | ISponsor> {
    await firebaseService.delete(ENTITY, data.id || data.key);
    return true;
  }
  protected async deleteAllCb(): Promise<boolean | void> {
    return true;
  }
  protected async getAllCb(
    filters?: Filters<Entity> | undefined
  ): Promise<void | ISponsor[]> {
    return (await firebaseService.findAll(
      ENTITY,
      filters as { [field: string]: string }
    )) as ISponsor[];
  }
  protected async updateCb(data: ISponsor): Promise<boolean | void | ISponsor> {
    await firebaseService.update(ENTITY, data.id || data.key, data);
    return true;
  }
  protected async patchCb(
    data: ISponsor,
    property: string
  ): Promise<CbResponse<ISponsor>> {
    await firebaseService.patch(
      ENTITY,
      data.key,
      property,
      data[property as keyof ISponsor]
    );
    return true;
  }
  constructor() {
    super(ENTITY);
  }
}
export const sponsorsResource = new SponsorsResource();
