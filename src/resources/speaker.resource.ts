import { ISpeaker } from 'src/entities';
import { firebaseService } from '../services/firebase.service';
import { Filters, Entity } from './localbase/state-db.controller';
import { Observable } from 'rxjs';
import { CbResponse } from './base.resource';
import { FbBaseResource } from './fb-base.resource';

const ENTITY = 'speakers';
class SpeakersResource extends FbBaseResource<ISpeaker> {
  protected streamCb(
    filters?: Filters<Entity> | undefined
  ): void | Observable<ISpeaker[]> {
    return firebaseService.streamWith<ISpeaker>(
      ENTITY,
      (filters && this.arrayFilter(filters)) ||
        (typeof filters == 'object' &&
          (filters as { [key: string]: string })) ||
        {}
    );
  }
  protected async getCb(key: string): Promise<boolean | void | ISpeaker> {
    return (await firebaseService.get(ENTITY, key)) as ISpeaker;
  }
  protected async createCb(data: ISpeaker): Promise<boolean | void | ISpeaker> {
    return (await firebaseService.create(ENTITY, data)) as ISpeaker;
  }
  protected async deleteCb(data: ISpeaker): Promise<boolean | void | ISpeaker> {
    await firebaseService.delete(ENTITY, data.id || data.key);
    return true;
  }
  protected async deleteAllCb(): Promise<boolean | void> {
    return true;
  }
  protected async getAllCb(
    filters?: Filters<Entity> | undefined
  ): Promise<void | ISpeaker[]> {
    return (await firebaseService.findAll(
      ENTITY,
      filters as { [field: string]: string }
    )) as ISpeaker[];
  }
  protected async updateCb(data: ISpeaker): Promise<boolean | void | ISpeaker> {
    await firebaseService.update(ENTITY, data.id || data.key, data);
    return true;
  }
  protected async patchCb(
    data: ISpeaker,
    property: string
  ): Promise<CbResponse<ISpeaker>> {
    await firebaseService.patch(
      ENTITY,
      data.key,
      property,
      data[property as keyof ISpeaker]
    );
    return true;
  }
  constructor() {
    super(ENTITY);
  }
}
export const speakersResource = new SpeakersResource();
