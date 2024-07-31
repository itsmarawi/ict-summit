import { IInstitution } from 'src/entities';
import { firebaseService } from '../services/firebase.service';
import { Filters, Entity } from './localbase/state-db.controller';
import { Observable } from 'rxjs';
import { CbResponse } from './base.resource';
import { FbBaseResource } from './fb-base.resource';

class InstitutionResource extends FbBaseResource<IInstitution> {
  protected streamCb(
    filters?: Filters<Entity> | undefined
  ): void | Observable<IInstitution[]> {
    return firebaseService.streamWith<IInstitution>(
      'institutions',
      (filters && this.arrayFilter(filters)) ||
        (typeof filters == 'object' &&
          (filters as { [key: string]: string })) ||
        {}
    );
  }
  protected async getCb(key: string): Promise<boolean | void | IInstitution> {
    return (await firebaseService.get('institutions', key)) as IInstitution;
  }
  protected async createCb(
    data: IInstitution
  ): Promise<boolean | void | IInstitution> {
    return (await firebaseService.create('institutions', data)) as IInstitution;
  }
  protected async deleteCb(
    data: IInstitution
  ): Promise<boolean | void | IInstitution> {
    await firebaseService.delete('institutions', data.id || data.key);
    return true;
  }
  protected async deleteAllCb(): Promise<boolean | void> {
    return true;
  }
  protected async getAllCb(
    filters?: Filters<Entity> | undefined
  ): Promise<void | IInstitution[]> {
    return (await firebaseService.findAll(
      'institutions',
      filters as { [field: string]: string }
    )) as IInstitution[];
  }
  protected async updateCb(
    data: IInstitution
  ): Promise<boolean | void | IInstitution> {
    await firebaseService.update('institutions', data.id || data.key, data);
    return true;
  }
  protected async patchCb(
    data: IInstitution,
    property: string
  ): Promise<CbResponse<IInstitution>> {
    await firebaseService.patch(
      'institutions',
      data.key,
      property,
      data[property as keyof IInstitution]
    );
    return true;
  }
  constructor() {
    super('institutions');
  }
}
export const institutionResource = new InstitutionResource();
