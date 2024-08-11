import { ITopic } from 'src/entities';
import { firebaseService } from '../services/firebase.service';
import { Filters, Entity } from './localbase/state-db.controller';
import { Observable } from 'rxjs';
import { CbResponse } from './base.resource';
import { FbBaseResource } from './fb-base.resource';

const ENTITY = 'topics';
class TopicsResource extends FbBaseResource<ITopic> {
  protected streamCb(
    filters?: Filters<Entity> | undefined
  ): void | Observable<ITopic[]> {
    return firebaseService.streamWith<ITopic>(
      ENTITY,
      (filters && this.arrayFilter(filters)) ||
        (typeof filters == 'object' &&
          (filters as { [key: string]: string })) ||
        {}
    );
  }
  protected async getCb(key: string): Promise<boolean | void | ITopic> {
    return (await firebaseService.get(ENTITY, key)) as ITopic;
  }
  protected async createCb(data: ITopic): Promise<boolean | void | ITopic> {
    return (await firebaseService.create(ENTITY, data)) as ITopic;
  }
  protected async deleteCb(data: ITopic): Promise<boolean | void | ITopic> {
    await firebaseService.delete(ENTITY, data.id || data.key);
    return true;
  }
  protected async deleteAllCb(): Promise<boolean | void> {
    return true;
  }
  protected async getAllCb(
    filters?: Filters<Entity> | undefined
  ): Promise<void | ITopic[]> {
    return (await firebaseService.findAll(
      ENTITY,
      filters as { [field: string]: string }
    )) as ITopic[];
  }
  protected async updateCb(data: ITopic): Promise<boolean | void | ITopic> {
    await firebaseService.update(ENTITY, data.id || data.key, data);
    return true;
  }
  protected async patchCb(
    data: ITopic,
    property: string
  ): Promise<CbResponse<ITopic>> {
    await firebaseService.patch(
      ENTITY,
      data.key,
      property,
      data[property as keyof ITopic]
    );
    return true;
  }
  constructor() {
    super(ENTITY);
  }
}
export const topicsResource = new TopicsResource();
