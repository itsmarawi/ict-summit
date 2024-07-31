import { IProfile } from 'src/entities';
import { firebaseService } from '../services/firebase.service';
import { CbResponse } from './base.resource';
import { Filters, Entity } from './localbase/state-db.controller';
import { Observable } from 'rxjs';
import { FbBaseResource } from './fb-base.resource';

class ProfileResource extends FbBaseResource<IProfile> {
  protected streamCb(
    filters?: Filters<Entity> | undefined
  ): void | Observable<IProfile[]> {
    return firebaseService.streamWith<IProfile>(
      'profiles',
      (filters && this.arrayFilter(filters)) ||
        (typeof filters == 'object' &&
          (filters as { [key: string]: string })) ||
        {}
    );
  }
  protected async getCb(key: string): Promise<boolean | void | IProfile> {
    return (await firebaseService.get('profiles', key)) as IProfile;
  }
  protected async createCb(data: IProfile): Promise<boolean | void | IProfile> {
    return (await firebaseService.create('profiles', data)) as IProfile;
  }
  protected async deleteCb(data: IProfile): Promise<boolean | void | IProfile> {
    await firebaseService.delete('profiles', data.id || data.key);
    return true;
  }
  protected async deleteAllCb(): Promise<boolean | void> {
    return true;
  }
  protected async getAllCb(
    filters?: Filters<Entity> | undefined
  ): Promise<void | IProfile[]> {
    return (await firebaseService.findAll(
      'profiles',
      filters as { [field: string]: string }
    )) as IProfile[];
  }
  protected async updateCb(data: IProfile): Promise<boolean | void | IProfile> {
    await firebaseService.update('institutions', data.id || data.key, data);
    return true;
  }
  protected async patchCb(
    data: IProfile,
    property: string
  ): Promise<CbResponse<IProfile>> {
    await firebaseService.patch(
      'profiles',
      data.key,
      property,
      data[property as keyof IProfile]
    );
    return true;
  }
  constructor() {
    super('profile');
  }
}
export const profileResource = new ProfileResource();
