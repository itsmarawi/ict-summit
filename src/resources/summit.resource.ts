import { ISummit } from 'src/entities';
import { firebaseService } from '../services/firebase.service';
import { Filters, Entity } from './localbase/state-db.controller';
import { Observable } from 'rxjs';
import { CbResponse } from './base.resource';
import { FbBaseResource } from './fb-base.resource';

const ENTITY = 'summits';
class SummitsResource extends FbBaseResource<ISummit> {
  protected streamCb(
    filters?: Filters<Entity> | undefined
  ): void | Observable<ISummit[]> {
    return firebaseService.streamWith<ISummit>(
      ENTITY,
      (filters && this.arrayFilter(filters)) ||
        (typeof filters == 'object' &&
          (filters as { [key: string]: string })) ||
        {}
    );
  }
  protected getKeyOf(v: ISummit): string {
    return v.year;
  }
  protected async getCb(key: string): Promise<boolean | void | ISummit> {
    return (await firebaseService.get(ENTITY, key)) as ISummit;
  }
  protected async createCb(data: ISummit): Promise<boolean | void | ISummit> {
    return (await firebaseService.create(ENTITY, data)) as ISummit;
  }
  protected async deleteCb(data: ISummit): Promise<boolean | void | ISummit> {
    await firebaseService.delete(ENTITY, data.id || data.key);
    return true;
  }
  protected async deleteAllCb(): Promise<boolean | void> {
    return true;
  }
  protected async getAllCb(
    filters?: Filters<Entity> | undefined
  ): Promise<void | ISummit[]> {
    return (await firebaseService.findAll(
      ENTITY,
      filters as { [field: string]: string }
    )) as ISummit[];
  }
  protected async updateCb(data: ISummit): Promise<boolean | void | ISummit> {
    await firebaseService.update(ENTITY, data.id || data.key, data);
    return true;
  }
  protected async patchCb(
    data: ISummit,
    property: string
  ): Promise<CbResponse<ISummit>> {
    await firebaseService.patch(
      ENTITY,
      data.key,
      property,
      data[property as keyof ISummit]
    );
    return true;
  }
  constructor() {
    super(ENTITY);
  }
}
export const summitsResource = new SummitsResource();
